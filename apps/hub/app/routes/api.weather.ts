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

// Calculate humidex (feels like temperature)
function calculateHumidex(temperatureC: number, humidity: number): number {
  if (temperatureC < 20 || humidity < 40) {
    return temperatureC; // Humidex not applicable
  }

  const dewpoint = temperatureC - (100 - humidity) / 5;
  const e = 6.11 * Math.exp(5417.753 * (1 / 273.16 - 1 / (dewpoint + 273.16)));
  const h = 0.5555 * (e - 10.0);

  return temperatureC + h;
}

// Calculate barometric trend
function calculateBarometricTrend(
  pressureHistory: number[],
): 'rising' | 'falling' | 'steady' {
  if (pressureHistory.length < 2) return 'steady';

  const recent = pressureHistory.slice(-6); // Last 6 readings (~30 minutes)
  if (recent.length < 3) return 'steady';

  const start = recent[0];
  const end = recent[recent.length - 1];
  const difference = end - start;

  // Threshold for significant change (mb)
  const threshold = 1.0;

  if (difference > threshold) return 'rising';
  if (difference < -threshold) return 'falling';
  return 'steady';
}

export async function loader() {
  // Get credentials from server-side environment variables
  const token = process.env.TEMPESTWX_TOKEN;
  const deviceId = process.env.TEMPESTWX_DEVICE_ID;

  if (!token || !deviceId) {
    throw new Response('Weather service not configured', { status: 500 });
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      let ws: WebSocket | null = null;
      let _isConnected = false;
      const pressureHistory: number[] = [];

      const encoder = new TextEncoder();

      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      const connectWebSocket = () => {
        try {
          ws = new WebSocket(
            `wss://ws.weatherflow.com/swd/data?token=${token}`,
          );

          ws.onopen = () => {
            console.log('Weather WebSocket connected');
            _isConnected = true;

            sendEvent('status', { status: 'connected' });

            // Send listen_start message
            const message = {
              type: 'listen_start',
              device_id: Number.parseInt(deviceId),
              id: Date.now().toString(),
            };

            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(message));
              console.log('Sent listen_start message');
            }
          };

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              console.log('Received weather data:', data);

              switch (data.type) {
                case 'ack':
                  console.log('Acknowledgment received');
                  break;

                case 'obs_air':
                  if (data.obs?.[0]) {
                    const obs = data.obs[0];
                    const weatherData: WeatherData = {
                      pressure: obs[1], // Station Pressure (MB)
                      temperature: obs[2], // Air Temperature (C)
                      humidity: obs[3], // Relative Humidity (%)
                      timestamp: obs[0], // Time Epoch
                    };

                    // Track pressure history for barometric trend
                    if (obs[1] !== undefined) {
                      pressureHistory.push(obs[1]);
                      if (pressureHistory.length > 20) {
                        pressureHistory.shift(); // Keep only last 20 readings
                      }
                      weatherData.barometricTrend =
                        calculateBarometricTrend(pressureHistory);
                    }

                    // Calculate feels like temperature
                    if (obs[2] !== undefined && obs[3] !== undefined) {
                      const humidex = calculateHumidex(obs[2], obs[3]);
                      const tempDiff = Math.abs(humidex - obs[2]);
                      if (tempDiff > 2 && obs[3] > 40) {
                        weatherData.feelsLike = humidex;
                      }
                    }

                    sendEvent('weather-data', weatherData);
                  }
                  break;

                case 'obs_sky':
                  if (data.obs?.[0]) {
                    const obs = data.obs[0];
                    const weatherData: WeatherData = {
                      uvIndex: obs[2], // UV Index
                      windSpeed: obs[5], // Wind Avg (m/s)
                      timestamp: obs[0], // Time Epoch
                    };
                    sendEvent('weather-data', weatherData);
                  }
                  break;

                case 'obs_st':
                  if (data.obs?.[0]) {
                    const obs = data.obs[0];
                    const weatherData: WeatherData = {
                      windSpeed: obs[2], // Wind Avg (m/s)
                      pressure: obs[6], // Station Pressure (MB)
                      temperature: obs[7], // Air Temperature (C)
                      humidity: obs[8], // Relative Humidity (%)
                      uvIndex: obs[10], // UV Index
                      timestamp: obs[0], // Time Epoch
                    };

                    // Track pressure history for barometric trend
                    if (obs[6] !== undefined) {
                      pressureHistory.push(obs[6]);
                      if (pressureHistory.length > 20) {
                        pressureHistory.shift(); // Keep only last 20 readings
                      }
                      weatherData.barometricTrend =
                        calculateBarometricTrend(pressureHistory);
                    }

                    // Calculate feels like temperature
                    if (obs[7] !== undefined && obs[8] !== undefined) {
                      const humidex = calculateHumidex(obs[7], obs[8]);
                      const tempDiff = Math.abs(humidex - obs[7]);
                      if (tempDiff > 2 && obs[8] > 40) {
                        weatherData.feelsLike = humidex;
                      }
                    }

                    sendEvent('weather-data', weatherData);
                  }
                  break;

                case 'rapid_wind':
                  if (data.ob) {
                    const obs = data.ob;
                    const weatherData: WeatherData = {
                      windSpeed: obs[1], // Wind Speed (m/s)
                      timestamp: obs[0], // Time Epoch
                    };
                    sendEvent('weather-data', weatherData);
                  }
                  break;

                case 'evt_strike':
                  if (data.evt) {
                    const weatherEvent: WeatherEvent = {
                      type: data.type,
                      timestamp: data.evt[0],
                      data: {
                        distance: data.evt[1], // Distance (km)
                        energy: data.evt[2], // Energy
                      },
                    };
                    sendEvent('weather-event', weatherEvent);
                  }
                  break;

                case 'evt_precip': {
                  const weatherEvent: WeatherEvent = {
                    type: data.type,
                    timestamp: Date.now() / 1000,
                    data: {
                      device_id: data.device_id,
                    },
                  };
                  sendEvent('weather-event', weatherEvent);
                  break;
                }

                default:
                  console.log('Unknown weather message type:', data.type);
              }
            } catch (error) {
              console.error('Error parsing weather WebSocket message:', error);
            }
          };

          ws.onerror = (error) => {
            console.error('Weather WebSocket error:', error);
            sendEvent('status', {
              status: 'error',
              error: 'WebSocket connection failed',
            });
          };

          ws.onclose = (event) => {
            console.log('Weather WebSocket closed:', event.code, event.reason);
            _isConnected = false;
            sendEvent('status', { status: 'disconnected' });

            // Auto-reconnect after 5 seconds if not manually closed
            if (event.code !== 1000) {
              setTimeout(() => {
                if (controller.desiredSize !== null) {
                  // Check if stream is still active
                  connectWebSocket();
                }
              }, 5000);
            }
          };
        } catch (error) {
          console.error('Error creating weather WebSocket:', error);
          sendEvent('status', {
            status: 'error',
            error: 'Failed to create WebSocket connection',
          });
        }
      };

      // Start the WebSocket connection
      connectWebSocket();

      // Handle stream cancellation
      return () => {
        if (ws) {
          if (ws.readyState === WebSocket.OPEN) {
            // Send listen_stop message
            const message = {
              type: 'listen_stop',
              device_id: Number.parseInt(deviceId),
              id: Date.now().toString(),
            };
            try {
              ws.send(JSON.stringify(message));
            } catch (error) {
              console.warn('Could not send listen_stop message:', error);
            }
          }
          ws.close();
        }
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
