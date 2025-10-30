import { WEATHERFLOW_CONFIG } from './config';
import { WeatherMessageHandler } from './message-handler';
import type {
  ObsAirMessage,
  ObservationsApiResponse,
  ObsSkyMessage,
  ObsStMessage,
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
   * Fetch recent observation summary (latest data + 24h min/max) for a device
   */
  async getObservationSummary(
    deviceId: number,
    token: string,
    stationLabel: string,
  ): Promise<{
    latestWeatherData?: WeatherData;
    minMax24h?: WeatherData['minMax24h'];
  }> {
    const result: {
      latestWeatherData?: WeatherData;
      minMax24h?: WeatherData['minMax24h'];
    } = {};

    try {
      const now = Math.floor(Date.now() / 1000);
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

        if (Array.isArray(data.obs) && data.obs.length > 0) {
          const messageHandler = new WeatherMessageHandler();
          const minMax: WeatherData['minMax24h'] = {};
          let latest: WeatherData | undefined;

          for (const obs of data.obs) {
            const inferredType = this.inferObservationType(obs, data.type);
            if (!inferredType) {
              continue;
            }

            let message: ObsStMessage | ObsSkyMessage | ObsAirMessage | null =
              null;

            switch (inferredType) {
              case 'obs_st':
                message = {
                  type: 'obs_st',
                  device_id: deviceId,
                  obs: [obs],
                } as ObsStMessage;
                break;
              case 'obs_sky':
                message = {
                  type: 'obs_sky',
                  device_id: deviceId,
                  obs: [obs],
                } as ObsSkyMessage;
                break;
              case 'obs_air':
                message = {
                  type: 'obs_air',
                  device_id: deviceId,
                  obs: [obs],
                } as ObsAirMessage;
                break;
              default:
                message = null;
            }

            if (!message) {
              continue;
            }

            const weatherData = messageHandler.processObservation(
              message,
              deviceId,
              stationLabel,
            );

            if (weatherData) {
              latest = {
                ...latest,
                ...weatherData,
                device_id: deviceId,
                stationLabel,
              };
              this.updateMinMaxFromWeatherData(minMax, weatherData);
            }
          }

          if (latest) {
            if (this.hasMinMaxData(minMax)) {
              latest = {
                ...latest,
                minMax24h: minMax,
              };
              result.minMax24h = minMax;
            } else if (latest.minMax24h) {
              result.minMax24h = latest.minMax24h;
            }
            result.latestWeatherData = latest;
          } else if (this.hasMinMaxData(minMax)) {
            result.minMax24h = minMax;
          }
        }
      }
    } catch (error) {
      logError(
        `Error fetching observation summary for device ${deviceId}:`,
        error,
      );
    }

    return result;
  }

  private inferObservationType(
    obs: number[],
    fallbackType?: ObservationsApiResponse['type'],
  ): ObservationsApiResponse['type'] | null {
    if (fallbackType && fallbackType !== 'rapid_wind') {
      return fallbackType;
    }
    if (!Array.isArray(obs)) {
      return null;
    }
    if (obs.length >= 21) {
      return 'obs_st';
    }
    if (obs.length >= 17) {
      return 'obs_sky';
    }
    if (obs.length >= 8) {
      return 'obs_air';
    }
    return fallbackType ?? null;
  }

  private updateMinMaxFromWeatherData(
    minMax: WeatherData['minMax24h'],
    weatherData: WeatherData,
  ) {
    if (!minMax || !weatherData) {
      return;
    }

    const updateMin = (current: number | undefined, value: number) =>
      current === undefined || value < current ? value : current;
    const updateMax = (current: number | undefined, value: number) =>
      current === undefined || value > current ? value : current;

    if (weatherData.temperature !== undefined) {
      minMax.tempMin = updateMin(minMax.tempMin, weatherData.temperature);
      minMax.tempMax = updateMax(minMax.tempMax, weatherData.temperature);
    }

    if (weatherData.humidity !== undefined) {
      minMax.humidityMin = updateMin(minMax.humidityMin, weatherData.humidity);
      minMax.humidityMax = updateMax(minMax.humidityMax, weatherData.humidity);
    }

    if (weatherData.windSpeed !== undefined) {
      minMax.windSpeedMax = updateMax(
        minMax.windSpeedMax,
        weatherData.windSpeed,
      );
    }

    if (weatherData.pressure !== undefined) {
      minMax.pressureMin = updateMin(minMax.pressureMin, weatherData.pressure);
      minMax.pressureMax = updateMax(minMax.pressureMax, weatherData.pressure);
    }

    if (weatherData.uvIndex !== undefined) {
      minMax.uvIndexMax = updateMax(minMax.uvIndexMax, weatherData.uvIndex);
    }
  }

  private hasMinMaxData(minMax: WeatherData['minMax24h']): boolean {
    if (!minMax) {
      return false;
    }

    return (
      minMax.tempMin !== undefined ||
      minMax.tempMax !== undefined ||
      minMax.humidityMin !== undefined ||
      minMax.humidityMax !== undefined ||
      minMax.windSpeedMax !== undefined ||
      minMax.pressureMin !== undefined ||
      minMax.pressureMax !== undefined ||
      minMax.uvIndexMax !== undefined
    );
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
