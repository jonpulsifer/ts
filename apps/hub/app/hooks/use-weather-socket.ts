'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface WeatherData {
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
  uvIndex?: number;
  timestamp?: number;
}

interface WeatherEvent {
  type: string;
  timestamp: number;
  data?: any;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function useWeatherSocket() {
  const [weatherData, setWeatherData] = useState<WeatherData>({});
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRef = useRef<string>(import.meta.env.VITE_TEMPESTWX_TOKEN || '');
  const deviceIdRef = useRef<number>(
    Number.parseInt(import.meta.env.VITE_TEMPESTWX_DEVICE_ID || ''),
  );
  const isManualDisconnectRef = useRef<boolean>(false);

  const connect = useCallback((token: string, deviceId: number) => {
    // Clean up any existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Validate inputs
    if (!token || !deviceId) {
      console.error('Token and Device ID are required');
      setConnectionStatus('error');
      return;
    }

    tokenRef.current = token;
    deviceIdRef.current = deviceId;
    isManualDisconnectRef.current = false;
    setConnectionStatus('connecting');

    try {
      const ws = new WebSocket(
        `wss://ws.weatherflow.com/swd/data?token=${token}`,
      );
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');

        // Send listen_start message
        const message = {
          type: 'listen_start',
          device_id: deviceId,
          id: Date.now().toString(),
        };

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
          console.log('Sent:', message);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data);

          setLastUpdate(Date.now());

          switch (data.type) {
            case 'ack':
              console.log('Acknowledgment received for ID:', data.id);
              break;

            case 'obs_air':
              // Air observations: [timestamp, station_pressure, air_temperature, relative_humidity, lightning_strike_count, lightning_strike_avg_distance, battery, report_interval]
              if (data.obs && data.obs[0]) {
                const obs = data.obs[0];
                setWeatherData((prev) => ({
                  ...prev,
                  pressure: obs[1], // MB
                  temperature: obs[2], // C
                  humidity: obs[3], // %
                  timestamp: obs[0],
                }));
              }
              break;

            case 'obs_sky':
              // Sky observations: [timestamp, illuminance, uv, rain_accumulated, wind_lull, wind_avg, wind_gust, wind_direction, battery, report_interval, solar_radiation, local_day_rain_accumulation, precipitation_type, wind_sample_interval]
              if (data.obs && data.obs[0]) {
                const obs = data.obs[0];
                setWeatherData((prev) => ({
                  ...prev,
                  uvIndex: obs[2], // UV Index
                  windSpeed: obs[5], // m/s
                  timestamp: obs[0],
                }));
              }
              break;

            case 'obs_st':
              // Tempest observations: [timestamp, wind_lull, wind_avg, wind_gust, wind_direction, wind_sample_interval, station_pressure, air_temperature, relative_humidity, illuminance, uv, solar_radiation, rain_accumulated, precipitation_type, lightning_strike_avg_distance, lightning_strike_count, battery, report_interval]
              if (data.obs && data.obs[0]) {
                const obs = data.obs[0];
                console.log('obs_st raw data:', obs);
                console.log('Temperature from obs[7]:', obs[7]);
                console.log('Full obs_st observation array:', data.obs);
                setWeatherData((prev) => ({
                  ...prev,
                  windSpeed: obs[2], // m/s (wind average)
                  pressure: obs[6], // MB
                  temperature: obs[7], // C
                  humidity: obs[8], // %
                  uvIndex: obs[10], // UV Index
                  timestamp: obs[0],
                }));
              }
              break;

            case 'rapid_wind':
              // Rapid wind: [timestamp, wind_speed, wind_direction]
              if (data.ob) {
                const obs = data.ob;
                setWeatherData((prev) => ({
                  ...prev,
                  windSpeed: obs[1], // m/s
                  timestamp: obs[0],
                }));
              }
              break;

            case 'evt_strike':
              // Lightning strike event: [timestamp, distance, energy]
              if (data.evt) {
                setEvents((prev) => [
                  ...prev,
                  {
                    type: data.type,
                    timestamp: data.evt[0],
                    data: {
                      distance: data.evt[1], // km
                      energy: data.evt[2],
                    },
                  },
                ]);
              }
              break;

            case 'evt_precip':
              // Rain start event - no evt array, just device_id
              setEvents((prev) => [
                ...prev,
                {
                  type: data.type,
                  timestamp: Date.now() / 1000, // Current timestamp since none provided
                  data: {
                    device_id: data.device_id,
                  },
                },
              ]);
              break;

            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        wsRef.current = null;

        // Only set to disconnected if we're not already in error state
        setConnectionStatus((currentStatus) => {
          if (currentStatus === 'error') return currentStatus;
          return 'disconnected';
        });

        // Auto-reconnect after 5 seconds if not manually closed and we have credentials
        if (
          !isManualDisconnectRef.current &&
          event.code !== 1000 &&
          tokenRef.current &&
          deviceIdRef.current
        ) {
          console.log('Attempting to reconnect in 5 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isManualDisconnectRef.current) {
              connect(tokenRef.current, deviceIdRef.current);
            }
          }, 5000);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setConnectionStatus('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;

    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      const ws = wsRef.current;

      // Only send listen_stop if connection is open
      if (ws.readyState === WebSocket.OPEN) {
        const message = {
          type: 'listen_stop',
          device_id: deviceIdRef.current,
          id: Date.now().toString(),
        };
        try {
          ws.send(JSON.stringify(message));
          console.log('Sent listen_stop message');
        } catch (error) {
          console.warn('Could not send listen_stop message:', error);
        }
      }

      ws.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    tokenRef.current = '';
    deviceIdRef.current = 0;
    setConnectionStatus('disconnected');
  }, []);

  // Auto-connect on mount if token and device ID are available
  useEffect(() => {
    if (
      tokenRef.current &&
      deviceIdRef.current &&
      connectionStatus === 'disconnected' &&
      !isManualDisconnectRef.current
    ) {
      console.log('Auto-connecting with token and device ID from environment');
      connect(tokenRef.current, deviceIdRef.current);
    }

    return () => {
      isManualDisconnectRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    weatherData,
    events,
    connectionStatus,
    lastUpdate,
    connect,
    disconnect,
  };
}
