import { log, logError, logInfo } from '~/lib/logger';
import { WeatherFlowApiClient } from '~/lib/weatherflow/api-client';
import { WeatherMessageHandler } from '~/lib/weatherflow/message-handler';
import type {
  AnyWebSocketMessage,
  ConnectionStatus,
  ListenStartMessage,
  WebSocketState,
} from '~/lib/weatherflow/types';
import { WeatherFlowWebSocketClient } from '~/lib/weatherflow/websocket-client';

export async function loader() {
  // Get credentials from server-side environment variables
  // Only tokens are required - auto-discover all stations and devices for each token
  const tokensEnv = process.env.TEMPESTWX_TOKENS;

  if (!tokensEnv) {
    const errorMessage =
      'Missing environment variable: TEMPESTWX_TOKENS must be configured (comma-separated list of tokens).';
    throw new Response(errorMessage, { status: 500 });
  }

  // Parse comma-separated tokens
  const configuredTokens = tokensEnv
    .split(',')
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  if (configuredTokens.length === 0) {
    const errorMessage =
      'Invalid TEMPESTWX_TOKENS: At least one token must be provided (comma-separated list).';
    throw new Response(errorMessage, { status: 500 });
  }

  // Initialize API client
  const apiClient = new WeatherFlowApiClient();

  // Pre-fetch all stations and devices to build complete mapping
  const { deviceToStation, tokenToStations, stationIdToStation } =
    await apiClient.fetchAllStationsAndDevices(configuredTokens);

  // Build tokenToDevices map - auto-discover all devices for each token
  const tokenToDevices = new Map<string, number[]>();

  for (const token of configuredTokens) {
    // Auto-discover: use all devices from all stations for this token
    const stationIds = tokenToStations.get(token) || [];
    const devices: number[] = [];
    for (const stationId of stationIds) {
      const stationInfo = stationIdToStation.get(stationId);
      if (stationInfo && stationInfo.token === token) {
        devices.push(...stationInfo.deviceIds);
      }
    }
    log(
      `Auto-discovered ${devices.length} device(s) for token from ${stationIds.length} station(s): ${devices.join(', ')}`,
    );

    if (devices.length > 0) {
      tokenToDevices.set(token, [...new Set(devices)]);
    }
  }

  // Log final device list per token
  for (const [, devices] of tokenToDevices.entries()) {
    log(`Final device list for token: ${devices.join(', ')}`);
  }

  // Validate we have at least one device to connect to
  const totalDevices = Array.from(tokenToDevices.values()).reduce(
    (sum, devices) => sum + devices.length,
    0,
  );
  if (totalDevices === 0) {
    const errorMessage =
      'No devices found for configured tokens. Check that TEMPESTWX_TOKENS contains valid tokens with access to weather stations.';
    throw new Response(errorMessage, { status: 500 });
  }

  const websocketClients: Map<string, WeatherFlowWebSocketClient> = new Map();
  let messageHandler: WeatherMessageHandler | null = null;
  let didCleanup = false;

  const cleanup = () => {
    if (didCleanup) {
      return;
    }

    didCleanup = true;

    for (const client of websocketClients.values()) {
      client.destroy();
    }
    websocketClients.clear();

    messageHandler?.clearAllHistories();
    messageHandler = null;

    log('Stream cancelled, cleaned up WebSocket connections');
  };

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      messageHandler = new WeatherMessageHandler();
      const lastPrefetch = new Map<number, number>();
      const connectionMeta = new Map<string, { hasConnected: boolean }>();
      const lastDataReceived = new Map<number, number>(); // deviceId -> timestamp

      const sendEvent = (event: string, data: unknown) => {
        if (didCleanup) {
          return;
        }
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (error) {
          logError('Error sending SSE event:', error);
        }
      };

      const getStationLabel = (deviceId: number) =>
        deviceToStation.get(deviceId) || '';

      const emitStatus = (
        status: ConnectionStatus,
        deviceId: number,
        stationLabel: string,
        extra?: Record<string, unknown>,
      ) => {
        const client = websocketClients.get(
          Array.from(tokenToDevices.entries()).find(([, devices]) =>
            devices.includes(deviceId),
          )?.[0] || '',
        );
        const websocketStatus = client?.getState();
        const lastData = lastDataReceived.get(deviceId);

        sendEvent('status', {
          status,
          device_id: deviceId,
          stationLabel,
          websocketStatus,
          lastDataReceived: lastData || null,
          ...(extra ?? {}),
        });
      };

      const prefetchForDevice = async (
        token: string,
        deviceId: number,
        stationLabel: string,
        options: { force?: boolean } = {},
      ) => {
        if (didCleanup) {
          return;
        }

        const handler = messageHandler;
        if (!handler) {
          return;
        }

        const now = Date.now();
        const { force = false } = options;
        if (!force) {
          const last = lastPrefetch.get(deviceId);
          if (last && now - last < 30000) {
            return;
          }
        }
        lastPrefetch.set(deviceId, now);

        await Promise.allSettled([
          (async () => {
            try {
              const latestMessage = await apiClient.getLatestObservation(
                deviceId,
                token,
              );

              if (!latestMessage) {
                return;
              }

              const weatherData = handler.processObservation(
                latestMessage,
                deviceId,
                stationLabel,
              );

              if (weatherData) {
                // Update last data received timestamp for prefetched data
                lastDataReceived.set(deviceId, Date.now());
                sendEvent('weather-data', weatherData);
              }
            } catch (error) {
              logError(
                `Error fetching latest observation for device ${deviceId}:`,
                error,
              );
            }
          })(),
          (async () => {
            try {
              const minMax24h = await apiClient.get24HourMinMax(
                deviceId,
                token,
              );

              if (minMax24h) {
                sendEvent('weather-data', {
                  device_id: deviceId,
                  stationLabel,
                  minMax24h,
                });
              }
            } catch (error) {
              logError(
                `Error fetching 24h min/max for device ${deviceId}:`,
                error,
              );
            }
          })(),
        ]);
      };

      const connectWebSocket = (token: string, deviceIds: number[]) => {
        let client = websocketClients.get(token);
        let meta = connectionMeta.get(token);
        if (!meta) {
          meta = { hasConnected: false };
          connectionMeta.set(token, meta);
        }

        const markDevices = (
          status: ConnectionStatus,
          extra?: Record<string, unknown>,
        ) => {
          for (const deviceId of deviceIds) {
            const stationLabel = getStationLabel(deviceId);
            emitStatus(status, deviceId, stationLabel, extra);
          }
        };

        if (!client) {
          client = new WeatherFlowWebSocketClient(token, deviceIds, {
            onConnect: () => {
              const isReconnect = meta?.hasConnected ?? false;
              log(
                `Weather WebSocket connected for token (${deviceIds.length} devices)`,
              );
              meta ||= { hasConnected: false };
              meta.hasConnected = true;
              connectionMeta.set(token, meta);

              for (const deviceId of deviceIds) {
                const stationLabel = getStationLabel(deviceId);
                emitStatus('connected', deviceId, stationLabel);
                void prefetchForDevice(token, deviceId, stationLabel, {
                  force: isReconnect,
                });
                const message: ListenStartMessage = {
                  type: 'listen_start',
                  device_id: deviceId,
                  id: `${Date.now()}-${deviceId}`,
                };
                client?.send(message);
              }
            },

            onDisconnect: (code, reason) => {
              logError(
                `WebSocket disconnected for token (code: ${code}, reason: ${reason || 'none'})`,
              );
              const disconnectReason =
                code === 1000
                  ? 'Normal closure'
                  : code === 1001
                    ? 'Going away'
                    : code === 1002
                      ? 'Protocol error'
                      : code === 1003
                        ? 'Unsupported data'
                        : code === 1006
                          ? 'Abnormal closure'
                          : code === 1007
                            ? 'Invalid data'
                            : code === 1008
                              ? 'Policy violation'
                              : code === 1009
                                ? 'Message too big'
                                : code === 1011
                                  ? 'Internal error'
                                  : `Unknown (${code})`;
              for (const deviceId of deviceIds) {
                const stationLabel = getStationLabel(deviceId);
                emitStatus('disconnected', deviceId, stationLabel, {
                  websocketError: `Disconnected: ${disconnectReason}${reason ? ` - ${reason}` : ''}`,
                });
              }
            },

            onError: (error) => {
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              logError('WebSocket error for token:', error);

              for (const deviceId of deviceIds) {
                const stationLabel = getStationLabel(deviceId);
                emitStatus('error', deviceId, stationLabel, {
                  error: stationLabel
                    ? `Failed to connect to ${stationLabel} (device ${deviceId}). WebSocket connection error. Check token validity and network connectivity.`
                    : `Failed to connect to device ${deviceId}. WebSocket connection error. Check token validity and network connectivity.`,
                  websocketError: errorMessage,
                });
              }
            },

            onMessage: (message: AnyWebSocketMessage) => {
              if (!message.device_id) {
                return;
              }

              const handler = messageHandler;
              if (!handler) {
                return;
              }

              const deviceIdFromData = message.device_id;

              if (!deviceIds.includes(deviceIdFromData)) {
                log(
                  `Ignoring message for untracked device ${deviceIdFromData} (tracking: ${deviceIds.join(', ')})`,
                );
                return;
              }

              log(
                `Received weather data for device ${deviceIdFromData}:`,
                message.type,
              );

              const stationLabel = getStationLabel(deviceIdFromData);

              const weatherData = handler.processObservation(
                message,
                deviceIdFromData,
                stationLabel,
              );
              if (weatherData) {
                // Update last data received timestamp
                lastDataReceived.set(deviceIdFromData, Date.now());
                emitStatus('connected', deviceIdFromData, stationLabel, {
                  websocketStatus: 'connected',
                  lastDataReceived: Date.now(),
                });
                sendEvent('weather-data', weatherData);
              }

              const weatherEvent = handler.processEvent(
                message,
                deviceIdFromData,
                stationLabel,
              );
              if (weatherEvent) {
                sendEvent('weather-event', weatherEvent);
              }

              if (message.type === 'ack') {
                emitStatus('connected', deviceIdFromData, stationLabel);
              }
            },

            onStateChange: (state: WebSocketState) => {
              logInfo(`WebSocket state changed for token: ${state}`);
              // Emit status updates for all devices when websocket state changes
              for (const deviceId of deviceIds) {
                const stationLabel = getStationLabel(deviceId);
                const connectionStatus: ConnectionStatus =
                  state === 'connected'
                    ? 'connected'
                    : state === 'error'
                      ? 'error'
                      : state === 'disconnected'
                        ? 'disconnected'
                        : 'connecting';
                emitStatus(connectionStatus, deviceId, stationLabel, {
                  websocketStatus: state,
                });
              }
            },
          });

          websocketClients.set(token, client);
        }

        markDevices('connecting');

        for (const deviceId of deviceIds) {
          const stationLabel = getStationLabel(deviceId);
          void prefetchForDevice(token, deviceId, stationLabel, {
            force: !(meta?.hasConnected ?? false),
          });
        }

        client.connect();
      };

      for (const [token, deviceIds] of tokenToDevices.entries()) {
        connectWebSocket(token, deviceIds);
      }
    },
    cancel() {
      cleanup();
    },
  });

  // Return the stream as a Server-Sent Events response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
