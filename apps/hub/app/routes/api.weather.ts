import { WeatherFlowApiClient } from '~/lib/weatherflow/api-client';
import { WeatherFlowWebSocketClient } from '~/lib/weatherflow/websocket-client';
import { WeatherMessageHandler } from '~/lib/weatherflow/message-handler';
import type {
  WeatherData,
  WeatherEvent,
  AnyWebSocketMessage,
  ListenStartMessage,
} from '~/lib/weatherflow/types';

// Logging utility - only log in development
const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
const log = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};
const logError = (...args: any[]) => {
  if (isDev) {
    console.error(...args);
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

  // Initialize API client
  const apiClient = new WeatherFlowApiClient();

  // Pre-fetch all stations and devices to build complete mapping
  const { deviceToStation, deviceToToken, tokenToStations, stationIdToStation } =
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
  for (const [token, devices] of tokenToDevices.entries()) {
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

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const websocketClients: Map<string, WeatherFlowWebSocketClient> = new Map();
      const messageHandler = new WeatherMessageHandler();

      const sendEvent = (event: string, data: any) => {
        try {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          logError('Error sending SSE event:', error);
        }
      };

      // Connect WebSocket for each token
      const connectWebSocket = async (token: string, deviceIds: number[]) => {
        // If WebSocket client already exists for this token, reuse it
        if (websocketClients.has(token)) {
          const existingClient = websocketClients.get(token);
          if (existingClient && existingClient.isConnected()) {
            log(`Reusing existing WebSocket for token`);
            // Send listen_start for any new devices
            for (const deviceId of deviceIds) {
              const message: ListenStartMessage = {
                type: 'listen_start',
                device_id: deviceId,
                id: `${Date.now()}-${deviceId}`,
              };
              existingClient.send(message);
            }
            return;
          }
        }

        // Create new WebSocket client
        const client = new WeatherFlowWebSocketClient(token, deviceIds, {
          onConnect: () => {
            log(`Weather WebSocket connected for token (${deviceIds.length} devices)`);

            // Send listen_start for each device and fetch initial data
            for (const deviceId of deviceIds) {
              const stationLabel = deviceToStation.get(deviceId) || '';

              // Fetch 24-hour min/max values
              apiClient
                .get24HourMinMax(deviceId, token)
                .then((minMax24h) => {
                  if (minMax24h) {
                    sendEvent('weather-data', {
                      device_id: deviceId,
                      stationLabel,
                      minMax24h,
                    });
                  }
                })
                .catch((error) => {
                  logError(`Error fetching 24h min/max for device ${deviceId}:`, error);
                });

              // Send status update
              sendEvent('status', {
                status: 'connected',
                device_id: deviceId,
                stationLabel,
              });

              // Send listen_start message
              const message: ListenStartMessage = {
                type: 'listen_start',
                device_id: deviceId,
                id: `${Date.now()}-${deviceId}`,
              };
              client.send(message);
            }
          },

          onDisconnect: (code, reason) => {
            log(`WebSocket disconnected for token (code: ${code}, reason: ${reason})`);

            // Send disconnected status for all devices on this token
            for (const deviceId of deviceIds) {
              const stationLabel = deviceToStation.get(deviceId) || '';
              sendEvent('status', {
                status: 'disconnected',
                device_id: deviceId,
                stationLabel,
              });
            }

            // Remove from clients map
            websocketClients.delete(token);
          },

          onError: (error) => {
            logError(`WebSocket error for token:`, error);

            // Send error status for all devices on this token
            for (const deviceId of deviceIds) {
              const stationLabel = deviceToStation.get(deviceId) || '';
              sendEvent('status', {
                status: 'error',
                error: stationLabel
                  ? `Failed to connect to ${stationLabel} (device ${deviceId}). WebSocket connection error. Check token validity and network connectivity.`
                  : `Failed to connect to device ${deviceId}. WebSocket connection error. Check token validity and network connectivity.`,
                device_id: deviceId,
                stationLabel,
              });
            }
          },

          onMessage: (message: AnyWebSocketMessage) => {
            const deviceIdFromData = message.device_id;

            // Handle system messages without device_id
            if (!deviceIdFromData) {
              if (message.type === 'connection_opened') {
                log('WebSocket connection opened successfully');
                // Update status to connected for all devices on this token
                for (const deviceId of deviceIds) {
                  const stationLabel = deviceToStation.get(deviceId) || '';
                  sendEvent('status', {
                    status: 'connected',
                    device_id: deviceId,
                    stationLabel,
                  });
                }
              }
              return;
            }

            // Only process messages for devices we're explicitly tracking
            if (!deviceIds.includes(deviceIdFromData)) {
              log(
                `Ignoring message for untracked device ${deviceIdFromData} (tracking: ${deviceIds.join(', ')})`,
              );
              return;
            }

            log(`Received weather data for device ${deviceIdFromData}:`, message.type);

            const stationLabel = deviceToStation.get(deviceIdFromData) || '';

            // Process observation messages
            const weatherData = messageHandler.processObservation(
              message,
              deviceIdFromData,
              stationLabel,
            );
            if (weatherData) {
              sendEvent('status', {
                status: 'connected',
                device_id: deviceIdFromData,
                stationLabel,
              });
              sendEvent('weather-data', weatherData);
            }

            // Process event messages
            const weatherEvent = messageHandler.processEvent(
              message,
              deviceIdFromData,
              stationLabel,
            );
            if (weatherEvent) {
              sendEvent('weather-event', weatherEvent);
            }

            // Handle acknowledgment
            if (message.type === 'ack') {
              sendEvent('status', {
                status: 'connected',
                device_id: deviceIdFromData,
                stationLabel,
              });
            }
          },

          onStateChange: (state) => {
            log(`WebSocket state changed for token: ${state}`);
            // Could send state updates if needed
          },
        });

        websocketClients.set(token, client);
        client.connect();
      };

      // Start WebSocket connections for each token
      for (const [token, deviceIds] of tokenToDevices.entries()) {
        connectWebSocket(token, deviceIds);
      }

      // Handle stream cancellation
      return () => {
        log('Stream cancelled, cleaning up WebSocket connections');

        // Cleanup all WebSocket clients
        for (const client of websocketClients.values()) {
          client.destroy();
        }
        websocketClients.clear();

        // Clear message handler histories
        messageHandler.clearAllHistories();
      };
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
