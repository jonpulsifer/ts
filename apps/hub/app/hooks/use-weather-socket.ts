'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ConnectionStatus,
  StationData,
  WeatherEvent,
} from '~/lib/weatherflow/types';

// Logging utility - only log in development
// NODE_ENV is replaced at build time by Remix/Vite
const isDev =
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'dev') ||
  (typeof import.meta !== 'undefined' && import.meta.env?.DEV === true);
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

export function useWeatherSocket() {
  const [stations, setStations] = useState<Map<number, StationData>>(new Map());
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnectRef = useRef<boolean>(false);
  const lastHeartbeatRef = useRef<number>(Date.now());
  const lastWeatherUpdateRef = useRef<number>(0);
  const reconnectingRef = useRef<boolean>(false);

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
    reconnectingRef.current = true;
    lastHeartbeatRef.current = Date.now();

    try {
      const eventSource = new EventSource('/api/weather');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        log('Weather SSE connected');
        reconnectingRef.current = false;
        lastHeartbeatRef.current = Date.now();
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
              };
              log(
                `Creating entry for device ${deviceId} (status: ${data.status})`,
              );
            }

            if (data.stationLabel) {
              existing.weatherData = {
                ...existing.weatherData,
                stationLabel: data.stationLabel,
              };
            }

            // Update the entry with the new status
            switch (data.status) {
              case 'connecting':
                existing.connectionStatus = 'connecting';
                break;
              case 'connected':
                existing.connectionStatus = 'connected';
                existing.lastUpdate = Date.now();
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
                logError(
                  `Weather service error for device ${deviceId}:`,
                  data.error,
                );
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

            if (!existing) {
              log(
                `Weather data received for new device ${deviceId}, creating entry`,
              );
              existing = {
                weatherData: {},
                connectionStatus: 'connecting',
                lastUpdate: null,
              };
            }

            existing.weatherData = {
              ...existing.weatherData,
              ...data,
            };
            existing.lastUpdate = Date.now();
            if (
              existing.connectionStatus === 'connecting' ||
              existing.connectionStatus === 'disconnected'
            ) {
              existing.connectionStatus = 'connected';
            }

            newStations.set(deviceId, existing);
            return newStations;
          });
          lastWeatherUpdateRef.current = Date.now();
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

      eventSource.addEventListener('heartbeat', () => {
        lastHeartbeatRef.current = Date.now();
      });

      eventSource.onerror = (error) => {
        logError('Weather SSE error:', error);
        reconnectingRef.current = false;

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
      reconnectingRef.current = false;
      const errorMessage =
        error instanceof Error
          ? `Failed to establish connection: ${error.message}`
          : 'Failed to establish connection. Check server configuration.';
      setConnectionError(errorMessage);
    }
  }, []);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    reconnectingRef.current = false;

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

  // Heartbeat watchdog - force reconnect if stream stalls
  useEffect(() => {
    const heartbeatCheck = setInterval(() => {
      if (isManualDisconnectRef.current) {
        return;
      }

      const now = Date.now();
      const heartbeatAge = now - lastHeartbeatRef.current;
      const readyState = eventSourceRef.current?.readyState;

      const isClosed = readyState === EventSource.CLOSED;
      const isHeartbeatStale = heartbeatAge > 45000;

      if ((isClosed || isHeartbeatStale) && !reconnectingRef.current) {
        log(
          `Heartbeat stale (${heartbeatAge}ms) or stream closed (${readyState}). Reconnecting SSE...`,
        );
        reconnectingRef.current = true;
        connect();
      }
    }, 15000);

    return () => clearInterval(heartbeatCheck);
  }, [connect]);

  // Detect stale weather updates even if SSE stays alive
  useEffect(() => {
    const dataFreshnessCheck = setInterval(() => {
      if (isManualDisconnectRef.current) {
        return;
      }

      if (stations.size === 0) {
        return;
      }

      if (lastWeatherUpdateRef.current === 0) {
        return;
      }

      const age = Date.now() - lastWeatherUpdateRef.current;
      if (age > 120000 && !reconnectingRef.current) {
        log(`No weather updates for ${age}ms. Reconnecting SSE.`);
        reconnectingRef.current = true;
        connect();
      }
    }, 60000);

    return () => clearInterval(dataFreshnessCheck);
  }, [stations.size, connect]);

  // Check if no stations are configured after initial connection
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
    setConnectionError(null);
  }, [stations.size, connectionError]);

  return {
    stations,
    events,
    connectionError,
    connect,
    disconnect,
  };
}
