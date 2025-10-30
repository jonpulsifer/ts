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
const logWarn = (...args: any[]) => {
  if (isDev) {
    console.warn(...args);
  }
};

interface WeatherData {
  temperature?: number;
  humidity?: number;
  windSpeed?: number; // Wind Avg (m/s)
  windLull?: number; // Wind Lull (m/s)
  windGust?: number; // Wind Gust (m/s)
  windDirection?: number; // Wind Direction (degrees)
  pressure?: number;
  uvIndex?: number;
  illuminance?: number; // Lux
  solarRadiation?: number; // W/m^2
  timestamp?: number;
  barometricTrend?: 'rising' | 'falling' | 'steady';
  feelsLike?: number;
  device_id?: number;
  stationLabel?: string;
  rainTotal?: number; // mm
  rainDuration?: number; // minutes
  minMax24h?: {
    tempMin?: number;
    tempMax?: number;
    humidityMin?: number;
    humidityMax?: number;
    windSpeedMax?: number;
    pressureMin?: number;
    pressureMax?: number;
    uvIndexMax?: number;
  };
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

// Fetch station name from WeatherFlow REST API
async function getStationName(
  deviceId: number,
  token: string,
  stationCache?: Map<number, string>,
): Promise<string> {
  // If cache is provided and has the device, use it
  if (stationCache && stationCache.has(deviceId)) {
    return stationCache.get(deviceId)!;
  }

  try {
    // Get all stations from REST API
    const response = await fetch(
      `https://swd.weatherflow.com/swd/rest/stations?token=${token}`,
    );

    if (response.ok) {
      const data = await response.json();
      // Find the station matching this device_id
      if (data.stations && Array.isArray(data.stations)) {
        for (const station of data.stations) {
          // Check if any device in this station matches
          if (station.devices && Array.isArray(station.devices)) {
            for (const device of station.devices) {
              if (device.device_id === deviceId) {
                // Use public_name or name from station
                const stationName = station.public_name || station.name || station.station_name || '';
                if (stationCache) {
                  stationCache.set(deviceId, stationName);
                }
                return stationName;
              }
            }
          }
          // Also check direct device_id match on station object
          if (station.device_id === deviceId) {
            const stationName = station.public_name || station.name || station.station_name || '';
            if (stationCache) {
              stationCache.set(deviceId, stationName);
            }
            return stationName;
          }
        }
      }
    }
  } catch (error) {
    logError(`Error fetching station name for device ${deviceId}:`, error);
  }

  // Fallback - return empty string to let UI handle it
  return '';
}

// Fetch 24-hour min/max values from WeatherFlow REST API
async function get24HourMinMax(
  deviceId: number,
  token: string,
): Promise<WeatherData['minMax24h']> {
  try {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const twentyFourHoursAgo = now - 24 * 60 * 60; // 24 hours ago

    const response = await fetch(
      `https://swd.weatherflow.com/swd/rest/observations/device/${deviceId}?token=${token}&time_start=${twentyFourHoursAgo}&time_end=${now}`,
    );

    if (response.ok) {
      const data = await response.json();
      
      if (data.obs && Array.isArray(data.obs) && data.obs.length > 0) {
        let tempMin: number | undefined;
        let tempMax: number | undefined;
        let humidityMin: number | undefined;
        let humidityMax: number | undefined;
        let windSpeedMax: number | undefined;
        let pressureMin: number | undefined;
        let pressureMax: number | undefined;
        let uvIndexMax: number | undefined;

        // Process all observations to find min/max values
        for (const obs of data.obs) {
          if (obs && Array.isArray(obs)) {
            // Check if it's obs_st (Tempest) format
            if (obs.length >= 21) {
              // obs_st format: [time, windLull, windAvg, windGust, windDir, windSampleInterval, 
              //                 pressure, temp, humidity, illuminance, uv, solarRad, ...]
              const temp = obs[7];
              const humidity = obs[8];
              const windSpeed = obs[2]; // windAvg
              const pressure = obs[6];
              const uvIndex = obs[10];

              if (temp !== null && temp !== undefined) {
                if (tempMin === undefined || temp < tempMin) tempMin = temp;
                if (tempMax === undefined || temp > tempMax) tempMax = temp;
              }
              if (humidity !== null && humidity !== undefined) {
                if (humidityMin === undefined || humidity < humidityMin) humidityMin = humidity;
                if (humidityMax === undefined || humidity > humidityMax) humidityMax = humidity;
              }
              if (windSpeed !== null && windSpeed !== undefined) {
                if (windSpeedMax === undefined || windSpeed > windSpeedMax) windSpeedMax = windSpeed;
              }
              if (pressure !== null && pressure !== undefined) {
                if (pressureMin === undefined || pressure < pressureMin) pressureMin = pressure;
                if (pressureMax === undefined || pressure > pressureMax) pressureMax = pressure;
              }
              if (uvIndex !== null && uvIndex !== undefined) {
                if (uvIndexMax === undefined || uvIndex > uvIndexMax) uvIndexMax = uvIndex;
              }
            } else if (obs.length >= 8) {
              // obs_air format: [time, pressure, temp, humidity, ...]
              const temp = obs[2];
              const humidity = obs[3];
              const pressure = obs[1];

              if (temp !== null && temp !== undefined) {
                if (tempMin === undefined || temp < tempMin) tempMin = temp;
                if (tempMax === undefined || temp > tempMax) tempMax = temp;
              }
              if (humidity !== null && humidity !== undefined) {
                if (humidityMin === undefined || humidity < humidityMin) humidityMin = humidity;
                if (humidityMax === undefined || humidity > humidityMax) humidityMax = humidity;
              }
              if (pressure !== null && pressure !== undefined) {
                if (pressureMin === undefined || pressure < pressureMin) pressureMin = pressure;
                if (pressureMax === undefined || pressure > pressureMax) pressureMax = pressure;
              }
            } else if (obs.length >= 17) {
              // obs_sky format: [time, illuminance, uv, rain, windLull, windAvg, windGust, windDir, ...]
              const windSpeed = obs[5]; // windAvg
              const uvIndex = obs[2];

              if (windSpeed !== null && windSpeed !== undefined) {
                if (windSpeedMax === undefined || windSpeed > windSpeedMax) windSpeedMax = windSpeed;
              }
              if (uvIndex !== null && uvIndex !== undefined) {
                if (uvIndexMax === undefined || uvIndex > uvIndexMax) uvIndexMax = uvIndex;
              }
            }
          }
        }

        return {
          tempMin,
          tempMax,
          humidityMin,
          humidityMax,
          windSpeedMax,
          pressureMin,
          pressureMax,
          uvIndexMax,
        };
      }
    }
  } catch (error) {
    logError(`Error fetching 24h min/max for device ${deviceId}:`, error);
  }

  return undefined;
}

// Fetch all stations and devices from WeatherFlow REST API
async function fetchAllStationsAndDevices(
  tokens: string[],
): Promise<{
  deviceToStation: Map<number, string>; // device_id -> station name
  deviceToToken: Map<number, string>; // device_id -> token
  tokenToStations: Map<string, number[]>; // token -> station_ids[]
  stationIdToStation: Map<number, { name: string; deviceIds: number[]; token: string }>; // station_id -> station info
}> {
  const deviceToStation = new Map<number, string>();
  const deviceToToken = new Map<number, string>();
  const tokenToStations = new Map<string, number[]>(); // token -> station_ids[]
  const stationIdToStation = new Map<number, { name: string; deviceIds: number[]; token: string }>();

  for (const token of tokens) {
    try {
      const response = await fetch(
        `https://swd.weatherflow.com/swd/rest/stations?token=${token}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.stations && Array.isArray(data.stations)) {
          const stationIdsForToken: number[] = [];
          
          for (const station of data.stations) {
            const stationId = station.station_id;
            const stationName =
              station.public_name || station.name || station.station_name || '';
            
            const deviceIds: number[] = [];

            // Check devices within station
            if (station.devices && Array.isArray(station.devices)) {
              for (const device of station.devices) {
                if (device.device_id) {
                  // Only include Tempest stations (ST), filter out base stations (HB)
                  // Base stations don't send weather observations, only Tempest devices do
                  const deviceType = device.device_type || device.device_type_name || '';
                  const isBaseStation = deviceType && deviceType.toUpperCase() === 'HB';
                  
                  if (isBaseStation) {
                    log(`Skipping base station (HB) device ${device.device_id} for station ${stationName} (${stationId})`);
                    continue;
                  }
                  
                  // Include ST devices (Tempest stations) - they have serial_number
                  // The serial_number identifies the ST device, not the HB base station
                  if (device.serial_number) {
                    log(`Found active Tempest device ${device.device_id} (type: ${deviceType || 'ST'}, serial: ${device.serial_number}) for station ${stationName} (${stationId})`);
                    deviceIds.push(device.device_id);
                    deviceToStation.set(device.device_id, stationName);
                    deviceToToken.set(device.device_id, token);
                  } else {
                    log(`Skipping device ${device.device_id} (no serial_number - must be ST device with serial) for station ${stationName} (${stationId})`);
                  }
                }
              }
            }
            // Also check direct device_id on station (only if it's a Tempest ST device)
            if (station.device_id) {
              if (!deviceIds.includes(station.device_id)) {
                const stationDeviceType = station.device_type || station.device_type_name || '';
                const isBaseStation = stationDeviceType && stationDeviceType.toUpperCase() === 'HB';
                
                if (isBaseStation) {
                  log(`Skipping base station (HB) device ${station.device_id} for station ${stationName} (${stationId})`);
                } else if (station.serial_number) {
                  // Only include if it has serial_number (ST device identifier)
                  log(`Found active Tempest device ${station.device_id} (type: ${stationDeviceType || 'ST'}, serial: ${station.serial_number}) for station ${stationName} (${stationId})`);
                  deviceIds.push(station.device_id);
                  deviceToStation.set(station.device_id, stationName);
                  deviceToToken.set(station.device_id, token);
                } else {
                  log(`Skipping device ${station.device_id} (no serial_number - must be ST device with serial) for station ${stationName} (${stationId})`);
                }
              }
            }

            // Store station info with token mapping
            if (stationId && deviceIds.length > 0) {
              stationIdToStation.set(stationId, {
                name: stationName,
                deviceIds,
                token,
              });
              stationIdsForToken.push(stationId);
            }
          }
          
          // Store token -> stations mapping
          if (stationIdsForToken.length > 0) {
            tokenToStations.set(token, stationIdsForToken);
            log(`Token has ${stationIdsForToken.length} station(s): ${stationIdsForToken.join(', ')}`);
          }
        }
      }
    } catch (error) {
      logError(`Error fetching stations for token:`, error);
    }
  }

  return { deviceToStation, deviceToToken, tokenToStations, stationIdToStation };
}

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

  // Pre-fetch all stations and devices to build complete mapping
  const { deviceToStation, deviceToToken, tokenToStations, stationIdToStation } =
    await fetchAllStationsAndDevices(configuredTokens);

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
    log(`Auto-discovered ${devices.length} device(s) for token from ${stationIds.length} station(s): ${devices.join(', ')}`);

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
      const websockets: Map<string, WebSocket> = new Map(); // token -> WebSocket
      const pressureHistories: Map<number, number[]> = new Map();
      const stationLabels = deviceToStation; // Use pre-fetched station names
      const keepAliveIntervals: Map<string, NodeJS.Timeout> = new Map();

      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Connect one WebSocket per token and listen to all devices for that token
      const connectWebSocket = async (token: string, deviceIds: number[]) => {
        // If WebSocket already exists for this token, reuse it
        if (websockets.has(token)) {
          const existingWs = websockets.get(token);
          if (existingWs && existingWs.readyState === WebSocket.OPEN) {
            log(`Reusing existing WebSocket for token`);
            // Send listen_start for any new devices
            for (const deviceId of deviceIds) {
              if (!pressureHistories.has(deviceId)) {
                pressureHistories.set(deviceId, []);
                const message = {
                  type: 'listen_start',
                  device_id: deviceId,
                  id: `${Date.now()}-${deviceId}`,
                };
                existingWs.send(JSON.stringify(message));
                log(`Sent listen_start message for device ${deviceId}`);
              }
            }
            return;
          }
        }

        try {
          const wsUrl = `wss://ws.weatherflow.com/swd/data?token=${token}`;
          log(`Connecting WebSocket for token (devices: ${deviceIds.join(', ')}): ${wsUrl.substring(0, 50)}...`);
          const ws = new WebSocket(wsUrl);

          websockets.set(token, ws);

          // Initialize pressure histories for all devices
          for (const deviceId of deviceIds) {
            if (!pressureHistories.has(deviceId)) {
              pressureHistories.set(deviceId, []);
            }
          }

          ws.onopen = async () => {
            log(`Weather WebSocket connected for token (${deviceIds.length} devices)`);

            // Send listen_start message for each device on this connection
            for (const deviceId of deviceIds) {
              const stationLabel = stationLabels.get(deviceId) || '';
              
              // Fetch 24-hour min/max values
              const minMax24h = await get24HourMinMax(deviceId, token);
              if (minMax24h) {
                sendEvent('weather-data', {
                  device_id: deviceId,
                  stationLabel,
                  minMax24h,
                });
              }
              
              sendEvent('status', {
                status: 'connected',
                device_id: deviceId,
                stationLabel,
              });

              // Send listen_start message
              const message = {
                type: 'listen_start',
                device_id: deviceId,
                id: `${Date.now()}-${deviceId}`,
              };

              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
                log(`Sent listen_start message for device ${deviceId}`);
              }
            }

            // Set up keepalive to prevent 10-minute idle timeout (send ping every 5 minutes)
            // Note: WeatherFlow doesn't have a ping frame, but we can send a lightweight message
            // Since we're already sending listen_start messages, the connection should stay active
            // But we'll set up a reconnection mechanism instead
            const keepAlive = setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) {
                // Connection is still open, no need to do anything
                // The regular observations will keep it alive
                log(`Keepalive check: WebSocket still open for token`);
              } else {
                clearInterval(keepAlive);
                keepAliveIntervals.delete(token);
              }
            }, 5 * 60 * 1000); // Check every 5 minutes
            keepAliveIntervals.set(token, keepAlive);
          };

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              const deviceIdFromData = data.device_id;
              
              // Handle system messages without device_id
              if (!deviceIdFromData) {
                if (data.type === 'connection_opened') {
                  log('WebSocket connection opened successfully');
                  // Update status to connected for all devices on this token
                  for (const deviceId of deviceIds) {
                    const stationLabel = stationLabels.get(deviceId) || '';
                    sendEvent('status', {
                      status: 'connected',
                      device_id: deviceId,
                      stationLabel,
                    });
                  }
                  return;
                }
                // For other messages without device_id, log and continue
                log('Received system message:', data.type);
                return;
              }

              // Only process messages for devices we're explicitly tracking
              // Use strict check to prevent devices with IDs off by one (e.g., inactive devices)
              if (!deviceIds.includes(deviceIdFromData)) {
                log(`Ignoring message for untracked device ${deviceIdFromData} (tracking: ${deviceIds.join(', ')})`);
                return;
              }

              log(`Received weather data for device ${deviceIdFromData}:`, data.type);

              // Get station label from cache or use fallback
              const stationLabel = stationLabels.get(deviceIdFromData) || '';
              const pressureHistory =
                pressureHistories.get(deviceIdFromData) || [];

              switch (data.type) {
                case 'ack':
                  log(`Acknowledgment received for device ${deviceIdFromData}`);
                  // Update status to connected when we receive acknowledgment
                  sendEvent('status', {
                    status: 'connected',
                    device_id: deviceIdFromData,
                    stationLabel,
                  });
                  break;

                case 'obs_air':
                  if (data.obs?.[0]) {
                    const obs = data.obs[0];
                    const weatherData: WeatherData = {
                      pressure: obs[1], // Station Pressure (MB)
                      temperature: obs[2], // Air Temperature (C)
                      humidity: obs[3], // Relative Humidity (%)
                      timestamp: obs[0], // Time Epoch
                      device_id: deviceIdFromData,
                      stationLabel,
                    };

                    // Track pressure history for barometric trend
                    if (obs[1] !== undefined) {
                      pressureHistory.push(obs[1]);
                      if (pressureHistory.length > 20) {
                        pressureHistory.shift(); // Keep only last 20 readings
                      }
                      pressureHistories.set(deviceIdFromData, pressureHistory);
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

                    // Ensure status is updated to connected when we receive valid data
                    sendEvent('status', {
                      status: 'connected',
                      device_id: deviceIdFromData,
                      stationLabel,
                    });
                    sendEvent('weather-data', weatherData);
                  }
                  break;

                case 'obs_sky':
                  if (data.obs?.[0]) {
                    const obs = data.obs[0];
                    const weatherData: WeatherData = {
                      uvIndex: obs[2], // UV Index
                      illuminance: obs[1], // Illuminance (Lux)
                      windLull: obs[4], // Wind Lull (m/s)
                      windSpeed: obs[5], // Wind Avg (m/s)
                      windGust: obs[6], // Wind Gust (m/s)
                      windDirection: obs[7], // Wind Direction (degrees)
                      solarRadiation: obs[10], // Solar Radiation (W/m^2)
                      timestamp: obs[0], // Time Epoch
                      device_id: deviceIdFromData,
                      stationLabel,
                    };

                    // Extract rain data from obs_sky if available
                    if (obs[11] !== undefined && obs[11] !== null) {
                      // Local Daily Rain Accumulation (mm) in obs_sky format
                      weatherData.rainTotal = obs[11];
                    } else if (obs[3] !== undefined && obs[3] !== null) {
                      // Rain Accumulated (mm) - fallback
                      weatherData.rainTotal = obs[3];
                    }

                    // Ensure status is updated to connected when we receive valid data
                    sendEvent('status', {
                      status: 'connected',
                      device_id: deviceIdFromData,
                      stationLabel,
                    });
                    sendEvent('weather-data', weatherData);
                  }
                  break;

                case 'obs_st':
                  if (data.obs?.[0]) {
                    const obs = data.obs[0];
                    const weatherData: WeatherData = {
                      windLull: obs[1], // Wind Lull (m/s)
                      windSpeed: obs[2], // Wind Avg (m/s)
                      windGust: obs[3], // Wind Gust (m/s)
                      windDirection: obs[4], // Wind Direction (degrees)
                      pressure: obs[6], // Station Pressure (MB)
                      temperature: obs[7], // Air Temperature (C)
                      humidity: obs[8], // Relative Humidity (%)
                      illuminance: obs[9], // Illuminance (Lux)
                      uvIndex: obs[10], // UV Index
                      solarRadiation: obs[11], // Solar Radiation (W/m^2)
                      timestamp: obs[0], // Time Epoch
                      device_id: deviceIdFromData,
                      stationLabel,
                    };

                    // Extract rain data from observations
                    if (obs[18] !== undefined && obs[18] !== null) {
                      // Local Daily Rain Accumulation (mm)
                      weatherData.rainTotal = obs[18];
                    } else if (obs[12] !== undefined && obs[12] !== null) {
                      // Rain Accumulated (mm) - fallback
                      weatherData.rainTotal = obs[12];
                    }

                    // Extract rain duration from summary if available
                    if (data.summary?.precip_minutes_local_day !== undefined) {
                      weatherData.rainDuration = data.summary.precip_minutes_local_day;
                    }

                    // Track pressure history for barometric trend
                    if (obs[6] !== undefined) {
                      pressureHistory.push(obs[6]);
                      if (pressureHistory.length > 20) {
                        pressureHistory.shift(); // Keep only last 20 readings
                      }
                      pressureHistories.set(deviceIdFromData, pressureHistory);
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

                    // Ensure status is updated to connected when we receive valid data
                    sendEvent('status', {
                      status: 'connected',
                      device_id: deviceIdFromData,
                      stationLabel,
                    });
                    sendEvent('weather-data', weatherData);
                  }
                  break;

                case 'rapid_wind':
                  if (data.ob) {
                    const obs = data.ob;
                    const weatherData: WeatherData = {
                      windSpeed: obs[1], // Wind Speed (m/s)
                      timestamp: obs[0], // Time Epoch
                      device_id: deviceIdFromData,
                      stationLabel,
                    };
                    // Ensure status is updated to connected when we receive valid data
                    sendEvent('status', {
                      status: 'connected',
                      device_id: deviceIdFromData,
                      stationLabel,
                    });
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
                        device_id: deviceIdFromData,
                        stationLabel,
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
                      device_id: deviceIdFromData,
                      stationLabel: stationLabels.get(deviceIdFromData) || '',
                    },
                  };
                  sendEvent('weather-event', weatherEvent);
                  break;
                }

                default:
                  log(
                    `Unknown weather message type for device ${deviceIdFromData}:`,
                    data.type,
                  );
              }
            } catch (error) {
              logError(
                `Error parsing weather WebSocket message:`,
                error,
              );
            }
          };

          ws.onerror = (error) => {
            logError(`Weather WebSocket error for token (devices: ${deviceIds.join(', ')}):`, error);
            // Log WebSocket state for debugging
            logError(`WebSocket state: ${ws.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`);
            // Send error status for all devices on this token
            for (const deviceId of deviceIds) {
              const stationLabel = stationLabels.get(deviceId) || '';
              sendEvent('status', {
                status: 'error',
                error: stationLabel
                  ? `Failed to connect to ${stationLabel} (device ${deviceId}). WebSocket connection error. Check token validity and network connectivity.`
                  : `Failed to connect to device ${deviceId}. WebSocket connection error. Check token validity and network connectivity.`,
                device_id: deviceId,
                stationLabel,
              });
            }
          };

          ws.onclose = (event) => {
            log(
              `Weather WebSocket closed for token (devices: ${deviceIds.join(', ')}):`,
              `code=${event.code}, reason=${event.reason || 'none'}, wasClean=${event.wasClean}`,
            );
            
            // Clear keepalive interval
            const keepAlive = keepAliveIntervals.get(token);
            if (keepAlive) {
              clearInterval(keepAlive);
              keepAliveIntervals.delete(token);
            }

            // Send disconnected status for all devices on this token
            for (const deviceId of deviceIds) {
              const stationLabel = stationLabels.get(deviceId) || '';
              sendEvent('status', {
                status: 'disconnected',
                device_id: deviceId,
                stationLabel,
              });
            }

            // Remove from websockets map
            websockets.delete(token);

            // Auto-reconnect after 5 seconds if not manually closed and stream is still active
            if (event.code !== 1000 && controller.desiredSize !== null) {
              setTimeout(() => {
                if (controller.desiredSize !== null) {
                  // Check if stream is still active
                  connectWebSocket(token, deviceIds);
                }
              }, 5000);
            }
          };
        } catch (error) {
          logError(
            `Error creating weather WebSocket for token:`,
            error,
          );
          // Send error status for all devices on this token
          for (const deviceId of deviceIds) {
            const stationLabel = stationLabels.get(deviceId) || '';
            const errorMessage =
              error instanceof Error
                ? stationLabel
                  ? `Failed to create WebSocket connection for ${stationLabel} (device ${deviceId}): ${error.message}`
                  : `Failed to create WebSocket connection for device ${deviceId}: ${error.message}`
                : stationLabel
                  ? `Failed to create WebSocket connection for ${stationLabel} (device ${deviceId})`
                  : `Failed to create WebSocket connection for device ${deviceId}`;
            sendEvent('status', {
              status: 'error',
              error: errorMessage,
              device_id: deviceId,
              stationLabel,
            });
          }
        }
      };

      // Start one WebSocket connection per token
      for (const [token, deviceIds] of tokenToDevices.entries()) {
        connectWebSocket(token, deviceIds);
      }

      // Handle stream cancellation
      return () => {
        // Clear all keepalive intervals
        keepAliveIntervals.forEach((interval) => clearInterval(interval));
        keepAliveIntervals.clear();

        // Close all WebSocket connections
        websockets.forEach((ws, token) => {
          if (ws.readyState === WebSocket.OPEN) {
            // Get devices for this token
            const deviceIds = tokenToDevices.get(token) || [];
            // Send listen_stop message for each device
            for (const deviceId of deviceIds) {
              const message = {
                type: 'listen_stop',
                device_id: deviceId,
                id: `${Date.now()}-${deviceId}`,
              };
              try {
                ws.send(JSON.stringify(message));
              } catch (error) {
                logWarn(
                  `Could not send listen_stop message for device ${deviceId}:`,
                  error,
                );
              }
            }
          }
          ws.close();
        });
        websockets.clear();
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
