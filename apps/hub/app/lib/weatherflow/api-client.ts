import { WEATHERFLOW_CONFIG } from './config';
import type {
  ObservationsApiResponse,
  StationApiResponse,
  StationMapping,
  WeatherData,
} from './types';

// Logging utility - only log in development
const isDev =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
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

/**
 * WeatherFlow REST API client
 */
export class WeatherFlowApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = WEATHERFLOW_CONFIG.REST_API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch station name for a device ID
   */
  async getStationName(
    deviceId: number,
    token: string,
    stationCache?: Map<number, string>,
  ): Promise<string> {
    // If cache is provided and has the device, use it
    if (stationCache?.has(deviceId)) {
      return stationCache.get(deviceId)!;
    }

    try {
      const response = await fetch(`${this.baseUrl}/stations?token=${token}`, {
        signal: AbortSignal.timeout(WEATHERFLOW_CONFIG.API_TIMEOUT),
      });

      if (response.ok) {
        const data = (await response.json()) as StationApiResponse;
        // Find the station matching this device_id
        if (data.stations && Array.isArray(data.stations)) {
          for (const station of data.stations) {
            // Check if any device in this station matches
            if (station.devices && Array.isArray(station.devices)) {
              for (const device of station.devices) {
                if (device.device_id === deviceId) {
                  const stationName =
                    station.public_name ||
                    station.name ||
                    station.station_name ||
                    '';
                  if (stationCache) {
                    stationCache.set(deviceId, stationName);
                  }
                  return stationName;
                }
              }
            }
            // Also check direct device_id match on station object
            if (station.device_id === deviceId) {
              const stationName =
                station.public_name ||
                station.name ||
                station.station_name ||
                '';
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

  /**
   * Fetch 24-hour min/max values for a device
   */
  async get24HourMinMax(
    deviceId: number,
    token: string,
  ): Promise<WeatherData['minMax24h']> {
    try {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const twentyFourHoursAgo =
        now - WEATHERFLOW_CONFIG.MIN_MAX_WINDOW_HOURS * 60 * 60;

      const response = await fetch(
        `${this.baseUrl}/observations/device/${deviceId}?token=${token}&time_start=${twentyFourHoursAgo}&time_end=${now}`,
        {
          signal: AbortSignal.timeout(WEATHERFLOW_CONFIG.API_TIMEOUT),
        },
      );

      if (response.ok) {
        const data = (await response.json()) as ObservationsApiResponse;

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
                  if (humidityMin === undefined || humidity < humidityMin)
                    humidityMin = humidity;
                  if (humidityMax === undefined || humidity > humidityMax)
                    humidityMax = humidity;
                }
                if (windSpeed !== null && windSpeed !== undefined) {
                  if (windSpeedMax === undefined || windSpeed > windSpeedMax)
                    windSpeedMax = windSpeed;
                }
                if (pressure !== null && pressure !== undefined) {
                  if (pressureMin === undefined || pressure < pressureMin)
                    pressureMin = pressure;
                  if (pressureMax === undefined || pressure > pressureMax)
                    pressureMax = pressure;
                }
                if (uvIndex !== null && uvIndex !== undefined) {
                  if (uvIndexMax === undefined || uvIndex > uvIndexMax)
                    uvIndexMax = uvIndex;
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
                  if (humidityMin === undefined || humidity < humidityMin)
                    humidityMin = humidity;
                  if (humidityMax === undefined || humidity > humidityMax)
                    humidityMax = humidity;
                }
                if (pressure !== null && pressure !== undefined) {
                  if (pressureMin === undefined || pressure < pressureMin)
                    pressureMin = pressure;
                  if (pressureMax === undefined || pressure > pressureMax)
                    pressureMax = pressure;
                }
              } else if (obs.length >= 17) {
                // obs_sky format: [time, illuminance, uv, rain, windLull, windAvg, windGust, windDir, ...]
                const windSpeed = obs[5]; // windAvg
                const uvIndex = obs[2];

                if (windSpeed !== null && windSpeed !== undefined) {
                  if (windSpeedMax === undefined || windSpeed > windSpeedMax)
                    windSpeedMax = windSpeed;
                }
                if (uvIndex !== null && uvIndex !== undefined) {
                  if (uvIndexMax === undefined || uvIndex > uvIndexMax)
                    uvIndexMax = uvIndex;
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

  /**
   * Fetch all stations and devices for multiple tokens
   */
  async fetchAllStationsAndDevices(tokens: string[]): Promise<StationMapping> {
    const deviceToStation = new Map<number, string>();
    const deviceToToken = new Map<number, string>();
    const tokenToStations = new Map<string, number[]>(); // token -> station_ids[]
    const stationIdToStation = new Map<
      number,
      {
        name: string;
        deviceIds: number[];
        token: string;
      }
    >();

    for (const token of tokens) {
      try {
        const response = await fetch(
          `${this.baseUrl}/stations?token=${token}`,
          {
            signal: AbortSignal.timeout(WEATHERFLOW_CONFIG.API_TIMEOUT),
          },
        );
        if (response.ok) {
          const data = (await response.json()) as StationApiResponse;
          if (data.stations && Array.isArray(data.stations)) {
            const stationIdsForToken: number[] = [];

            for (const station of data.stations) {
              const stationId = station.station_id;
              const stationName =
                station.public_name ||
                station.name ||
                station.station_name ||
                '';

              const deviceIds: number[] = [];

              // Check devices within station
              if (station.devices && Array.isArray(station.devices)) {
                for (const device of station.devices) {
                  if (device.device_id) {
                    // Only include Tempest stations (ST), filter out base stations (HB)
                    const deviceType =
                      device.device_type || device.device_type_name || '';
                    const isBaseStation =
                      deviceType && deviceType.toUpperCase() === 'HB';

                    if (isBaseStation) {
                      log(
                        `Skipping base station (HB) device ${device.device_id} for station ${stationName} (${stationId})`,
                      );
                      continue;
                    }

                    // Include ST devices (Tempest stations) - they have serial_number
                    if (device.serial_number) {
                      log(
                        `Found active Tempest device ${device.device_id} (type: ${deviceType || 'ST'}, serial: ${device.serial_number}) for station ${stationName} (${stationId})`,
                      );
                      deviceIds.push(device.device_id);
                      deviceToStation.set(device.device_id, stationName);
                      deviceToToken.set(device.device_id, token);
                    } else {
                      log(
                        `Skipping device ${device.device_id} (no serial_number - must be ST device with serial) for station ${stationName} (${stationId})`,
                      );
                    }
                  }
                }
              }
              // Also check direct device_id on station (only if it's a Tempest ST device)
              if (station.device_id) {
                if (!deviceIds.includes(station.device_id)) {
                  const stationDeviceType =
                    station.device_type || station.device_type_name || '';
                  const isBaseStation =
                    stationDeviceType &&
                    stationDeviceType.toUpperCase() === 'HB';

                  if (isBaseStation) {
                    log(
                      `Skipping base station (HB) device ${station.device_id} for station ${stationName} (${stationId})`,
                    );
                  } else if (station.serial_number) {
                    // Only include if it has serial_number (ST device identifier)
                    log(
                      `Found active Tempest device ${station.device_id} (type: ${stationDeviceType || 'ST'}, serial: ${station.serial_number}) for station ${stationName} (${stationId})`,
                    );
                    deviceIds.push(station.device_id);
                    deviceToStation.set(station.device_id, stationName);
                    deviceToToken.set(station.device_id, token);
                  } else {
                    log(
                      `Skipping device ${station.device_id} (no serial_number - must be ST device with serial) for station ${stationName} (${stationId})`,
                    );
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
              log(
                `Token has ${stationIdsForToken.length} station(s): ${stationIdsForToken.join(', ')}`,
              );
            }
          }
        }
      } catch (error) {
        logError('Error fetching stations for token:', error);
      }
    }

    return {
      deviceToStation,
      deviceToToken,
      tokenToStations,
      stationIdToStation,
    };
  }
}
