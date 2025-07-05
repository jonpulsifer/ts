'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface WeatherData {
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
  uvIndex?: number;
  timestamp?: number;
  barometricTrend?: 'rising' | 'falling' | 'steady';
  feelsLike?: number;
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
    setConnectionStatus('connecting');

    try {
      const eventSource = new EventSource('/api/weather');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('Weather SSE connected');
        setConnectionStatus('connected');
      };

      // Handle status updates
      eventSource.addEventListener('status', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Status update:', data);

          switch (data.status) {
            case 'connected':
              setConnectionStatus('connected');
              break;
            case 'disconnected':
              setConnectionStatus('disconnected');
              break;
            case 'error':
              setConnectionStatus('error');
              console.error('Weather service error:', data.error);
              break;
          }
        } catch (error) {
          console.error('Error parsing status event:', error);
        }
      });

      // Handle weather data updates
      eventSource.addEventListener('weather-data', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Weather data received:', data);

          setLastUpdate(Date.now());
          setWeatherData((prev) => ({
            ...prev,
            ...data,
          }));
        } catch (error) {
          console.error('Error parsing weather data:', error);
        }
      });

      // Handle weather events (lightning, rain, etc.)
      eventSource.addEventListener('weather-event', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Weather event received:', data);

          setEvents((prev) => [...prev, data]);
        } catch (error) {
          console.error('Error parsing weather event:', error);
        }
      });

      eventSource.onerror = (error) => {
        console.error('Weather SSE error:', error);

        // Only set to error if we're not already disconnected
        setConnectionStatus((currentStatus) => {
          if (currentStatus === 'disconnected') return currentStatus;
          return 'error';
        });

        // Auto-reconnect after 5 seconds if not manually closed
        if (!isManualDisconnectRef.current) {
          console.log('Attempting to reconnect in 5 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isManualDisconnectRef.current) {
              connect();
            }
          }, 5000);
        }
      };
    } catch (error) {
      console.error('Error creating EventSource:', error);
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

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnectionStatus('disconnected');
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (connectionStatus === 'disconnected' && !isManualDisconnectRef.current) {
      console.log('Auto-connecting to weather service');
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

  return {
    weatherData,
    events,
    connectionStatus,
    lastUpdate,
    connect,
    disconnect,
  };
}
