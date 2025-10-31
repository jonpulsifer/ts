/**
 * Weather WebSocket Manager
 *
 * Architecture:
 * - Server WebSocket connections to Tempest are PERSISTENT and INDEPENDENT
 * - WebSocket connections live independently of client SSE connections
 * - Multiple SSE clients can connect/disconnect without affecting WebSocket lifecycle
 * - WebSocket connections are shared across all SSE clients
 * - Status updates are throttled to prevent UI flickering from frequent state changes
 * - Only meaningful state changes trigger status updates (not every reconnecting ping)
 */
import { log } from '~/lib/logger';
import { WeatherFlowApiClient } from '~/lib/weatherflow/api-client';
import { WeatherMessageHandler } from '~/lib/weatherflow/message-handler';
import type {
  AnyWebSocketMessage,
  ConnectionStatus,
  ListenStartMessage,
  WebSocketState,
} from '~/lib/weatherflow/types';
import { WeatherFlowWebSocketClient } from '~/lib/weatherflow/websocket-client';

// Global WebSocket manager - persists across SSE connections
// This ensures WebSocket connections are independent of client SSE lifecycle
const globalWebSocketManager = {
  clients: new Map<string, WeatherFlowWebSocketClient>(),
  messageHandler: new WeatherMessageHandler(),
  sseClients: new Set<{
    sendEvent: (event: string, data: unknown) => void;
  }>(),
  lastPrefetch: new Map<number, number>(),
  connectionMeta: new Map<string, { hasConnected: boolean }>(),
  lastDataReceived: new Map<number, number>(),
  statusThrottle: new Map<
    number,
    { lastEmit: number; pendingStatus: ConnectionStatus | null }
  >(),
  deviceToStation: new Map<number, string>(),
  tokenToDevices: new Map<string, number[]>(),
  apiClient: null as WeatherFlowApiClient | null,
};

// Throttle status updates to prevent flickering (only emit every 2 seconds max)
const STATUS_THROTTLE_MS = 2000;

// Broadcast event to all SSE clients
const broadcastEvent = (event: string, data: unknown) => {
  for (const client of globalWebSocketManager.sseClients) {
    try {
      client.sendEvent(event, data);
    } catch (error) {
      log.error('Error broadcasting to SSE client:', error);
    }
  }
};

// Throttled status emission - only emit meaningful state changes
const emitStatusThrottled = (
  status: ConnectionStatus,
  deviceId: number,
  stationLabel: string,
  extra?: Record<string, unknown>,
) => {
  const now = Date.now();
  const throttle = globalWebSocketManager.statusThrottle.get(deviceId);

  // Check if we should throttle this status update
  if (throttle && throttle.lastEmit > 0) {
    const timeSinceLastEmit = now - throttle.lastEmit;

    // If same status and within throttle window, skip
    if (
      throttle.pendingStatus === status &&
      timeSinceLastEmit < STATUS_THROTTLE_MS
    ) {
      return;
    }

    // If different status, always emit (meaningful change)
    if (throttle.pendingStatus !== status) {
      // Reset throttle and emit immediately
      globalWebSocketManager.statusThrottle.set(deviceId, {
        lastEmit: now,
        pendingStatus: status,
      });
    } else {
      // Same status but throttle expired, emit
      globalWebSocketManager.statusThrottle.set(deviceId, {
        lastEmit: now,
        pendingStatus: status,
      });
    }
  } else {
    // First status for this device, emit immediately
    globalWebSocketManager.statusThrottle.set(deviceId, {
      lastEmit: now,
      pendingStatus: status,
    });
  }

  const token = Array.from(
    globalWebSocketManager.tokenToDevices.entries(),
  ).find(([, devices]) => devices.includes(deviceId))?.[0];
  const client = token ? globalWebSocketManager.clients.get(token) : undefined;
  const websocketStatus = client?.getState();
  const lastData = globalWebSocketManager.lastDataReceived.get(deviceId);

  broadcastEvent('status', {
    status,
    device_id: deviceId,
    stationLabel,
    websocketStatus,
    lastDataReceived: lastData || null,
    ...(extra ?? {}),
  });
};

// Ensure WebSocket connections are established (shared across all SSE clients)
const ensureWebSocketConnections = () => {
  const getStationLabel = (deviceId: number) =>
    globalWebSocketManager.deviceToStation.get(deviceId) || '';

  const prefetchForDevice = async (
    token: string,
    deviceId: number,
    stationLabel: string,
    options: { force?: boolean } = {},
  ) => {
    const handler = globalWebSocketManager.messageHandler;
    if (!handler || !globalWebSocketManager.apiClient) {
      return;
    }

    const now = Date.now();
    const { force = false } = options;
    if (!force) {
      const last = globalWebSocketManager.lastPrefetch.get(deviceId);
      if (last && now - last < 30000) {
        return;
      }
    }
    globalWebSocketManager.lastPrefetch.set(deviceId, now);

    await Promise.allSettled([
      (async () => {
        try {
          const latestMessage =
            await globalWebSocketManager.apiClient!.getLatestObservation(
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
            globalWebSocketManager.lastDataReceived.set(deviceId, Date.now());
            broadcastEvent('weather-data', weatherData);
          }
        } catch (error) {
          log.error(
            `Error fetching latest observation for device ${deviceId}:`,
            error,
          );
        }
      })(),
      (async () => {
        try {
          const minMax24h =
            await globalWebSocketManager.apiClient!.get24HourMinMax(
              deviceId,
              token,
            );

          if (minMax24h) {
            broadcastEvent('weather-data', {
              device_id: deviceId,
              stationLabel,
              minMax24h,
            });
          }
        } catch (error) {
          log.error(
            `Error fetching 24h min/max for device ${deviceId}:`,
            error,
          );
        }
      })(),
    ]);
  };

  for (const [
    token,
    deviceIds,
  ] of globalWebSocketManager.tokenToDevices.entries()) {
    let client = globalWebSocketManager.clients.get(token);
    let meta = globalWebSocketManager.connectionMeta.get(token);
    if (!meta) {
      meta = { hasConnected: false };
      globalWebSocketManager.connectionMeta.set(token, meta);
    }

    // Check if existing client is in stuck state and needs to be rebuilt
    if (client) {
      const clientState = client.getState();
      if (clientState === 'error' || clientState === 'reconnecting') {
        log.warn(
          `Existing websocket client for token is in stuck state (${clientState}), destroying and recreating`,
        );
        try {
          client.destroy();
        } catch (error) {
          log.error('Error destroying stuck websocket client:', error);
        }
        globalWebSocketManager.clients.delete(token);
        globalWebSocketManager.connectionMeta.delete(token);
        client = null;
        meta = { hasConnected: false };
        globalWebSocketManager.connectionMeta.set(token, meta);
      }
    }

    if (!client) {
      client = new WeatherFlowWebSocketClient(token, deviceIds, {
        onConnect: () => {
          const isReconnect = meta?.hasConnected ?? false;
          log.info(
            `Weather WebSocket connected for token (${deviceIds.length} devices)`,
          );
          meta ||= { hasConnected: false };
          meta.hasConnected = true;
          globalWebSocketManager.connectionMeta.set(token, meta);

          for (const deviceId of deviceIds) {
            const stationLabel = getStationLabel(deviceId);
            emitStatusThrottled('connected', deviceId, stationLabel, {
              websocketStatus: 'connected',
              websocketError: null,
            });
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
          log.error(
            `WebSocket disconnected for token (code: ${code}, reason: ${reason || 'none'})`,
          );
          // Don't emit status updates for transient disconnects - WebSocket will reconnect
          // Only log for debugging
        },

        onError: (error) => {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          log.error('WebSocket error for token:', error);

          // Only emit error for configuration issues, not transient connection errors
          for (const deviceId of deviceIds) {
            const stationLabel = getStationLabel(deviceId);
            // Check if this is a configuration error (usually happens on initial connect)
            if (
              errorMessage.includes('token') ||
              errorMessage.includes('auth')
            ) {
              emitStatusThrottled('error', deviceId, stationLabel, {
                error: stationLabel
                  ? `Failed to connect to ${stationLabel} (device ${deviceId}). Check token validity.`
                  : `Failed to connect to device ${deviceId}. Check token validity.`,
                websocketError: errorMessage,
              });
            }
          }
        },

        onMessage: (message: AnyWebSocketMessage) => {
          if (!message.device_id) {
            return;
          }

          const handler = globalWebSocketManager.messageHandler;
          if (!handler) {
            return;
          }

          const deviceIdFromData = message.device_id;

          if (!deviceIds.includes(deviceIdFromData)) {
            log.debug(
              `Ignoring message for untracked device ${deviceIdFromData} (tracking: ${deviceIds.join(', ')})`,
            );
            return;
          }

          log.debug(
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
            globalWebSocketManager.lastDataReceived.set(
              deviceIdFromData,
              Date.now(),
            );
            // Don't emit status on every data message - only emit when data arrives after disconnect
            broadcastEvent('weather-data', weatherData);
          }

          const weatherEvent = handler.processEvent(
            message,
            deviceIdFromData,
            stationLabel,
          );
          if (weatherEvent) {
            broadcastEvent('weather-event', weatherEvent);
          }
        },

        onStateChange: (state: WebSocketState) => {
          log.info(`WebSocket state changed for token: ${state}`);
          // Always emit websocketStatus updates so UI can show stuck connecting/reconnecting states
          for (const deviceId of deviceIds) {
            const stationLabel = getStationLabel(deviceId);
            const lastData =
              globalWebSocketManager.lastDataReceived.get(deviceId);

            // Determine connectionStatus based on data availability
            let connectionStatus: ConnectionStatus;
            if (lastData) {
              connectionStatus = 'connected';
            } else if (state === 'error') {
              connectionStatus = 'error';
            } else if (state === 'connected') {
              connectionStatus = 'connected';
            } else {
              // For connecting/reconnecting/disconnected, keep as disconnected
              connectionStatus = 'disconnected';
            }

            // For connected/error states, use throttled emission
            if (state === 'connected' || state === 'error') {
              emitStatusThrottled(connectionStatus, deviceId, stationLabel, {
                websocketStatus: state,
              });
            } else {
              // For connecting/reconnecting/disconnected, emit websocketStatus updates
              // but throttle them more aggressively (every 4 seconds instead of 2)
              const now = Date.now();
              const throttle =
                globalWebSocketManager.statusThrottle.get(deviceId);
              const shouldEmit =
                !throttle || now - throttle.lastEmit > STATUS_THROTTLE_MS * 2;

              if (shouldEmit) {
                broadcastEvent('status', {
                  status: connectionStatus,
                  device_id: deviceId,
                  stationLabel,
                  websocketStatus: state,
                  lastDataReceived: lastData || null,
                });
                globalWebSocketManager.statusThrottle.set(deviceId, {
                  lastEmit: now,
                  pendingStatus: connectionStatus,
                });
              }
            }
          }
        },
      });

      globalWebSocketManager.clients.set(token, client);
    }

    // Connect if not already connected
    if (
      client.getState() !== 'connected' &&
      client.getState() !== 'connecting'
    ) {
      for (const deviceId of deviceIds) {
        const stationLabel = getStationLabel(deviceId);
        void prefetchForDevice(token, deviceId, stationLabel, {
          force: !(meta?.hasConnected ?? false),
        });
      }
      client.connect();
    }
  }
};

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

  // Initialize API client (only if not already initialized)
  if (!globalWebSocketManager.apiClient) {
    globalWebSocketManager.apiClient = new WeatherFlowApiClient();
  }
  const apiClient = globalWebSocketManager.apiClient;

  // Initialize device mappings if not already done
  if (globalWebSocketManager.deviceToStation.size === 0) {
    // Pre-fetch all stations and devices to build complete mapping
    const { deviceToStation, tokenToStations, stationIdToStation } =
      await apiClient.fetchAllStationsAndDevices(configuredTokens);

    // Store device-to-station mapping globally
    for (const [deviceId, stationLabel] of deviceToStation.entries()) {
      globalWebSocketManager.deviceToStation.set(deviceId, stationLabel);
    }

    // Build tokenToDevices map - auto-discover all devices for each token
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
      log.info(
        `Auto-discovered ${devices.length} device(s) for token from ${stationIds.length} station(s): ${devices.join(', ')}`,
      );

      if (devices.length > 0) {
        globalWebSocketManager.tokenToDevices.set(token, [...new Set(devices)]);
      }
    }

    // Log final device list per token
    for (const [, devices] of globalWebSocketManager.tokenToDevices.entries()) {
      log.info(`Final device list for token: ${devices.join(', ')}`);
    }

    // Validate we have at least one device to connect to
    const totalDevices = Array.from(
      globalWebSocketManager.tokenToDevices.values(),
    ).reduce((sum, devices) => sum + devices.length, 0);
    if (totalDevices === 0) {
      const errorMessage =
        'No devices found for configured tokens. Check that TEMPESTWX_TOKENS contains valid tokens with access to weather stations.';
      throw new Response(errorMessage, { status: 500 });
    }
  }

  // Ensure WebSocket connections are established (they persist independently)
  ensureWebSocketConnections();

  // Create a readable stream for Server-Sent Events
  // SSE clients are registered with the global manager to receive broadcasts
  let cleanupSSEClient: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let isClosed = false;

      const sendEvent = (event: string, data: unknown) => {
        if (isClosed) {
          return;
        }
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (error) {
          log.error('Error sending SSE event:', error);
        }
      };

      // Register this SSE client with the global manager
      // It will receive broadcasts from WebSocket connections
      const sseClient = { sendEvent };
      globalWebSocketManager.sseClients.add(sseClient);

      // Send initial status for all devices to the new client
      for (const [
        token,
        deviceIds,
      ] of globalWebSocketManager.tokenToDevices.entries()) {
        const client = globalWebSocketManager.clients.get(token);
        const websocketStatus = client?.getState();

        for (const deviceId of deviceIds) {
          const stationLabel =
            globalWebSocketManager.deviceToStation.get(deviceId) || '';
          const lastData =
            globalWebSocketManager.lastDataReceived.get(deviceId);

          // Determine connection status based on data availability
          const connectionStatus: ConnectionStatus = lastData
            ? 'connected'
            : websocketStatus === 'error'
              ? 'error'
              : 'disconnected';

          sendEvent('status', {
            status: connectionStatus,
            device_id: deviceId,
            stationLabel,
            websocketStatus,
            lastDataReceived: lastData || null,
          });
        }
      }

      // Store cleanup function for cancel handler
      // Note: WebSocket connections persist independently and are NOT closed here
      cleanupSSEClient = () => {
        isClosed = true;
        globalWebSocketManager.sseClients.delete(sseClient);
        log.debug('SSE client disconnected (WebSocket connections persist)');
      };
    },
    cancel() {
      // SSE client disconnected - remove from manager
      // WebSocket connections persist independently
      if (cleanupSSEClient) {
        cleanupSSEClient();
      } else {
        log.debug('SSE stream cancelled (WebSocket connections persist)');
      }
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
