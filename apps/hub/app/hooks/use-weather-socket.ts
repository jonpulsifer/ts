'use client';

/**
 * Client-side hook for consuming weather data via Server-Sent Events (SSE).
 *
 * Architecture:
 * - Client is a PASSIVE consumer - only receives data from server via SSE
 * - Client CANNOT control server WebSocket connections to Tempest
 * - Connection status reflects data availability, not WebSocket technical state
 * - Server manages all WebSocket connections to Tempest independently
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { log } from '~/lib/logger';
import type { StationData, WeatherEvent } from '~/lib/weatherflow/types';

export function useWeatherSocket() {
  const [stations, setStations] = useState<Map<number, StationData>>(new Map());
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [sseStatus, setSseStatus] = useState<
    'connected' | 'connecting' | 'disconnected'
  >('disconnected');

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnectRef = useRef<boolean>(false);

  const connect = useCallback(() => {
    // Clean up any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    isManualDisconnectRef.current = false;
    setSseStatus('connecting');

    try {
      const eventSource = new EventSource('/api/weather');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        log.info('Weather SSE connected');
        setSseStatus('connected');
        // Connection status will be set per station via status events
      };

      // Handle status updates
      eventSource.addEventListener('status', (event) => {
        try {
          const data = JSON.parse(event.data);
          log.debug('Status update:', data);

          const deviceId = data.device_id;
          if (!deviceId) return;

          setStations((prev) => {
            const newStations = new Map(prev);
            let existing = newStations.get(deviceId);

            // If we receive a status update from the server, the device is being tracked
            // Create an entry if we don't have one yet
            if (!existing) {
              existing = {
                weatherData: {},
                connectionStatus: 'disconnected',
                lastUpdate: null,
                websocketStatus: data.websocketStatus, // Keep for debugging only
                websocketError: data.websocketError, // Keep for debugging only
                lastDataReceived: data.lastDataReceived || null,
              };
              log.info(
                `Creating entry for device ${deviceId} (status: ${data.status})`,
              );
            }

            // Update websocket status and related fields (for debugging only, not UI display)
            if (data.websocketStatus !== undefined) {
              existing.websocketStatus = data.websocketStatus;
            }
            if (data.websocketError !== undefined) {
              existing.websocketError =
                data.websocketError === null ? undefined : data.websocketError;
            }
            if (data.lastDataReceived !== undefined) {
              existing.lastDataReceived = data.lastDataReceived;
            }

            // Simplified connection status: based on data availability, not WebSocket technical state
            // 'connected' = has data available, 'disconnected' = no data, 'error' = configuration error only
            if (data.status === 'error' && data.error) {
              const errorMsg = data.stationLabel
                ? `${data.stationLabel}: ${data.error}`
                : data.error;
              const isConfigError =
                data.error.includes('environment variables') ||
                data.error.includes('not configured') ||
                data.error.includes('Missing') ||
                data.error.includes('Failed to create WebSocket connection');

              if (isConfigError) {
                existing.connectionStatus = 'error';
                setConnectionError((prev) => {
                  if (prev && !prev.includes(errorMsg)) {
                    return `${prev}\n\n${errorMsg}`;
                  }
                  return errorMsg;
                });
              }
              // Don't update status for transient WebSocket errors - keep existing status
            } else if (data.status === 'connected') {
              // Only mark as connected if we have actual data, otherwise keep current status
              // Status will be updated to 'connected' when weather data arrives
              if (existing.weatherData.timestamp) {
                existing.connectionStatus = 'connected';
              }
              // Clear error for this station if it was previously in error state
              setConnectionError((prev) => {
                if (!prev) return null;
                const stationError = data.stationLabel
                  ? `${data.stationLabel}:`
                  : `Device ${deviceId}:`;
                if (prev.includes(stationError)) {
                  const lines = prev.split('\n\n');
                  const filtered = lines.filter(
                    (line) => !line.includes(stationError),
                  );
                  return filtered.length > 0 ? filtered.join('\n\n') : null;
                }
                return prev;
              });
            }
            // Ignore 'disconnected' and 'connecting' status updates - UI reflects data availability

            newStations.set(deviceId, existing);
            return newStations;
          });
        } catch (error) {
          log.error('Error parsing status event:', error);
        }
      });

      // Handle weather data updates
      eventSource.addEventListener('weather-data', (event) => {
        try {
          const data = JSON.parse(event.data);
          log.debug('Weather data received:', data);

          const deviceId = data.device_id;
          if (!deviceId) return;

          setStations((prev) => {
            const newStations = new Map(prev);
            let existing = newStations.get(deviceId);

            // Auto-create entry if it doesn't exist (handles race conditions)
            // This ensures data is never lost even if it arrives before status events
            if (!existing) {
              log.info(
                `Auto-creating station entry for device ${deviceId} from weather data`,
              );
              existing = {
                weatherData: {},
                connectionStatus: 'connected', // Assume connected if we're receiving data
                lastUpdate: null,
                websocketStatus: 'connected',
                lastDataReceived: Date.now(),
              };
            }

            // Merge weather data (preserve existing data)
            existing.weatherData = {
              ...existing.weatherData,
              ...data,
            };
            existing.lastUpdate = Date.now();
            existing.lastDataReceived = Date.now();

            // Update connection status to connected since we have data
            // This is the primary way we determine connection status
            existing.connectionStatus = 'connected';

            // Update websocket status for debugging (not exposed to UI)
            existing.websocketStatus = 'connected';

            newStations.set(deviceId, existing);
            return newStations;
          });
        } catch (error) {
          log.error('Error parsing weather data:', error);
        }
      });

      // Handle weather events (lightning, rain, etc.)
      eventSource.addEventListener('weather-event', (event) => {
        try {
          const data = JSON.parse(event.data);
          log.debug('Weather event received:', data);

          setEvents((prev) => [...prev, data]);
        } catch (error) {
          log.error('Error parsing weather event:', error);
        }
      });

      eventSource.onerror = (error) => {
        log.error('Weather SSE error:', error);

        // Update SSE status based on readyState
        if (eventSource.readyState === EventSource.CLOSED) {
          setSseStatus('disconnected');
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          setSseStatus('connecting');
        }

        // Check if the error is due to HTTP error response
        if (eventSource.readyState === EventSource.CLOSED) {
          // Try to get more specific error if available
          fetch('/api/weather')
            .then((response) => {
              if (!response.ok) {
                return response.text().then((text) => {
                  setConnectionError(
                    text ||
                      `HTTP ${response.status}: Failed to connect to weather service`,
                  );
                });
              }
            })
            .catch(() => {
              setConnectionError(
                'Failed to connect to weather service. The server may be unavailable or misconfigured.',
              );
            });
        } else {
          setConnectionError(
            'Failed to connect to weather service. Check server logs.',
          );
        }

        // Auto-reconnect after 5 seconds if not manually closed
        if (!isManualDisconnectRef.current) {
          log.info('Attempting to reconnect in 5 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isManualDisconnectRef.current) {
              connect();
            }
          }, 5000);
        }
      };
    } catch (error) {
      log.error('Error creating EventSource:', error);
      const errorMessage =
        error instanceof Error
          ? `Failed to establish connection: ${error.message}`
          : 'Failed to establish connection. Check server configuration.';
      setConnectionError(errorMessage);
    }
  }, []);

  // Note: Removed disconnect() - client shouldn't control server connections
  // Client just passively receives data via SSE

  // Auto-connect on mount
  useEffect(() => {
    if (!isManualDisconnectRef.current) {
      log.info('Auto-connecting to weather service');
      connect();
    }

    return () => {
      isManualDisconnectRef.current = true;
      setSseStatus('disconnected');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  // Check if stations are configured (show error if none after delay)
  useEffect(() => {
    if (stations.size === 0) {
      const timeout = setTimeout(() => {
        if (stations.size === 0 && !connectionError) {
          setConnectionError(
            'No weather stations configured. Please set TEMPESTWX_TOKENS environment variable (comma-separated list of tokens).',
          );
        }
      }, 3000); // Wait 3 seconds before showing error

      return () => clearTimeout(timeout);
    }
  }, [stations.size, connectionError]);

  // Note: Removed auto-healing reconnect logic - client should not spam server
  // Server manages its own WebSocket connections independently

  return {
    stations,
    events,
    connectionError,
    sseStatus,
    connect, // Only reconnects SSE, doesn't affect server WebSocket
  };
}
