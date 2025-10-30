'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { log, logError, logInfo, logWarn } from '~/lib/logger';
import type {
  ConnectionStatus,
  StationData,
  WeatherEvent,
} from '~/lib/weatherflow/types';

export function useWeatherSocket() {
  const [stations, setStations] = useState<Map<number, StationData>>(new Map());
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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

    try {
      const eventSource = new EventSource('/api/weather');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        log('Weather SSE connected');
        // Connection status will be set per station via status events
      };

      // Handle status updates
      eventSource.addEventListener('status', (event) => {
        try {
          const data = JSON.parse(event.data);
          log('Status update:', data);

          const deviceId = data.device_id;
          if (!deviceId) return;

          setStations((prev) => {
            const newStations = new Map(prev);
            let existing = newStations.get(deviceId);

            // If we receive a status update from the server, the device is being tracked
            // Create an entry if we don't have one yet (for any status: connected, error, disconnected)
            if (!existing) {
              existing = {
                weatherData: {},
                connectionStatus:
                  (data.status as ConnectionStatus) || 'disconnected',
                lastUpdate: null,
                websocketStatus: data.websocketStatus,
                websocketError: data.websocketError,
                lastDataReceived: data.lastDataReceived || null,
              };
              logInfo(
                `Creating entry for device ${deviceId} (status: ${data.status}, websocket: ${data.websocketStatus || 'unknown'})`,
              );
            }

            // Update websocket status and related fields
            if (data.websocketStatus !== undefined) {
              existing.websocketStatus = data.websocketStatus;
            }
            if (data.websocketError !== undefined) {
              existing.websocketError = data.websocketError;
            }
            if (data.lastDataReceived !== undefined) {
              existing.lastDataReceived = data.lastDataReceived;
            }

            // Update the entry with the new status
            switch (data.status) {
              case 'connected':
                existing.connectionStatus = 'connected';
                // Clear error for this station if it was previously in error state
                setConnectionError((prev) => {
                  if (!prev) return null;
                  // Remove this station's error from the combined error message
                  const stationError = data.stationLabel
                    ? `${data.stationLabel}:`
                    : `Device ${deviceId}:`;
                  // If the error message contains this station's error, remove it
                  if (prev.includes(stationError)) {
                    const lines = prev.split('\n\n');
                    const filtered = lines.filter(
                      (line) => !line.includes(stationError),
                    );
                    return filtered.length > 0 ? filtered.join('\n\n') : null;
                  }
                  return prev;
                });
                break;
              case 'disconnected':
                existing.connectionStatus = 'disconnected';
                // Log websocket disconnection details
                if (data.websocketError) {
                  logWarn(
                    `Device ${deviceId} (${data.stationLabel || 'unknown'}) disconnected: ${data.websocketError}`,
                  );
                }
                break;
              case 'error':
                existing.connectionStatus = 'error';
                // Only set global error for configuration errors, not transient connection errors
                if (data.error) {
                  const errorMsg = data.stationLabel
                    ? `${data.stationLabel}: ${data.error}`
                    : data.error;
                  // Only track errors that look like configuration errors (not transient WebSocket errors)
                  const isConfigError =
                    data.error.includes('environment variables') ||
                    data.error.includes('not configured') ||
                    data.error.includes('Missing') ||
                    data.error.includes(
                      'Failed to create WebSocket connection',
                    );

                  if (isConfigError) {
                    setConnectionError((prev) => {
                      // Combine errors if multiple stations have errors
                      if (prev && !prev.includes(errorMsg)) {
                        return `${prev}\n\n${errorMsg}`;
                      }
                      return errorMsg;
                    });
                  }
                }
                // Log websocket errors with details
                if (data.websocketError) {
                  logError(
                    `WebSocket error for device ${deviceId} (${data.stationLabel || 'unknown'}): ${data.websocketError}`,
                  );
                }
                if (data.error) {
                  logError(
                    `Weather service error for device ${deviceId}:`,
                    data.error,
                  );
                }
                break;
            }

            newStations.set(deviceId, existing);
            return newStations;
          });
        } catch (error) {
          logError('Error parsing status event:', error);
        }
      });

      // Handle weather data updates
      eventSource.addEventListener('weather-data', (event) => {
        try {
          const data = JSON.parse(event.data);
          log('Weather data received:', data);

          const deviceId = data.device_id;
          if (!deviceId) return;

          setStations((prev) => {
            const newStations = new Map(prev);
            let existing = newStations.get(deviceId);

            // Auto-create entry if it doesn't exist (handles race conditions)
            // This ensures data is never lost even if it arrives before status events
            if (!existing) {
              logInfo(
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

            // Update connection status to connected if we have data
            if (existing.connectionStatus !== 'connected') {
              existing.connectionStatus = 'connected';
            }
            if (existing.websocketStatus !== 'connected') {
              existing.websocketStatus = 'connected';
            }

            newStations.set(deviceId, existing);
            return newStations;
          });
        } catch (error) {
          logError('Error parsing weather data:', error);
        }
      });

      // Handle weather events (lightning, rain, etc.)
      eventSource.addEventListener('weather-event', (event) => {
        try {
          const data = JSON.parse(event.data);
          log('Weather event received:', data);

          setEvents((prev) => [...prev, data]);
        } catch (error) {
          logError('Error parsing weather event:', error);
        }
      });

      eventSource.onerror = (error) => {
        logError('Weather SSE error:', error);

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
          log('Attempting to reconnect in 5 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isManualDisconnectRef.current) {
              connect();
            }
          }, 5000);
        }
      };
    } catch (error) {
      logError('Error creating EventSource:', error);
      const errorMessage =
        error instanceof Error
          ? `Failed to establish connection: ${error.message}`
          : 'Failed to establish connection. Check server configuration.';
      setConnectionError(errorMessage);
    }
  }, []);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;

    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setStations(new Map());
    setConnectionError(null);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (!isManualDisconnectRef.current) {
      log('Auto-connecting to weather service');
      connect();
    }

    return () => {
      isManualDisconnectRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  // Auto-healing: Check if stations have data and retry if needed
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

    // Auto-healing: Check if stations have stale data or are disconnected
    const healthCheckInterval = setInterval(() => {
      const now = Date.now();
      const staleThreshold = 120000; // 2 minutes without updates
      let needsReconnect = false;

      for (const [deviceId, station] of stations.entries()) {
        const isStale =
          station.lastUpdate === null ||
          now - station.lastUpdate > staleThreshold;
        const isDisconnected = station.connectionStatus === 'disconnected';
        const hasNoData = !station.weatherData.timestamp;

        if ((isStale || isDisconnected || hasNoData) && !connectionError) {
          log(
            `Station ${deviceId} health check failed: stale=${isStale}, disconnected=${isDisconnected}, noData=${hasNoData}`,
          );
          needsReconnect = true;
        }
      }

      if (needsReconnect) {
        log('Auto-healing: Reconnecting due to stale/disconnected stations');
        connect();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [stations, connectionError, connect]);

  return {
    stations,
    events,
    connectionError,
    connect,
    disconnect,
  };
}
