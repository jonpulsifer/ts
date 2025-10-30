import type {
  AnyWebSocketMessage,
  WeatherData,
  WeatherEvent,
  ObsAirMessage,
  ObsSkyMessage,
  ObsStMessage,
  RapidWindMessage,
  EvtStrikeMessage,
  EvtPrecipMessage,
} from './types';
import { WEATHERFLOW_CONFIG } from './config';

// Logging utility - only log in development
const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
const log = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};

/**
 * Calculate humidex (feels like temperature)
 */
function calculateHumidex(temperatureC: number, humidity: number): number {
  if (
    temperatureC < WEATHERFLOW_CONFIG.HUMIDEX_MIN_TEMP ||
    humidity < WEATHERFLOW_CONFIG.HUMIDEX_MIN_HUMIDITY
  ) {
    return temperatureC; // Humidex not applicable
  }

  const dewpoint = temperatureC - (100 - humidity) / 5;
  const e = 6.11 * Math.exp(5417.753 * (1 / 273.16 - 1 / (dewpoint + 273.16)));
  const h = 0.5555 * (e - 10.0);

  return temperatureC + h;
}

/**
 * Calculate barometric trend from pressure history
 */
function calculateBarometricTrend(
  pressureHistory: number[],
): 'rising' | 'falling' | 'steady' {
  if (pressureHistory.length < 2) return 'steady';

  const recent = pressureHistory.slice(-6); // Last 6 readings (~30 minutes)
  if (recent.length < 3) return 'steady';

  const start = recent[0];
  const end = recent[recent.length - 1];
  const difference = end - start;

  const threshold = WEATHERFLOW_CONFIG.PRESSURE_TREND_THRESHOLD;

  if (difference > threshold) return 'rising';
  if (difference < -threshold) return 'falling';
  return 'steady';
}

/**
 * Handles parsing and processing of WebSocket messages from WeatherFlow API
 */
export class WeatherMessageHandler {
  private pressureHistories: Map<number, number[]> = new Map();

  /**
   * Parse raw WebSocket message and validate type
   */
  parseMessage(rawData: string): AnyWebSocketMessage | null {
    try {
      const data = JSON.parse(rawData);
      // Basic validation - check for required type field
      if (!data || typeof data.type !== 'string') {
        log('Invalid message: missing type field');
        return null;
      }
      return data as AnyWebSocketMessage;
    } catch (error) {
      log('Error parsing WebSocket message:', error);
      return null;
    }
  }

  /**
   * Process observation message and convert to WeatherData
   */
  processObservation(
    message: AnyWebSocketMessage,
    deviceId: number,
    stationLabel: string,
  ): WeatherData | null {
    switch (message.type) {
      case 'obs_air':
        return this.processObsAir(message as ObsAirMessage, deviceId, stationLabel);
      case 'obs_sky':
        return this.processObsSky(message as ObsSkyMessage, deviceId, stationLabel);
      case 'obs_st':
        return this.processObsSt(message as ObsStMessage, deviceId, stationLabel);
      case 'rapid_wind':
        return this.processRapidWind(
          message as RapidWindMessage,
          deviceId,
          stationLabel,
        );
      default:
        return null;
    }
  }

  /**
   * Process obs_air message
   */
  private processObsAir(
    message: ObsAirMessage,
    deviceId: number,
    stationLabel: string,
  ): WeatherData | null {
    if (!message.obs?.[0]) return null;

    const obs = message.obs[0];
    const weatherData: WeatherData = {
      pressure: obs[1], // Station Pressure (MB)
      temperature: obs[2], // Air Temperature (C)
      humidity: obs[3], // Relative Humidity (%)
      timestamp: obs[0], // Time Epoch
      device_id: deviceId,
      stationLabel,
    };

    // Track pressure history for barometric trend
    if (obs[1] !== undefined) {
      const pressureHistory = this.pressureHistories.get(deviceId) || [];
      pressureHistory.push(obs[1]);
      if (pressureHistory.length > WEATHERFLOW_CONFIG.PRESSURE_HISTORY_SIZE) {
        pressureHistory.shift(); // Keep only last N readings
      }
      this.pressureHistories.set(deviceId, pressureHistory);
      weatherData.barometricTrend = calculateBarometricTrend(pressureHistory);
    }

    // Calculate feels like temperature
    if (obs[2] !== undefined && obs[3] !== undefined) {
      const humidex = calculateHumidex(obs[2], obs[3]);
      const tempDiff = Math.abs(humidex - obs[2]);
      if (
        tempDiff > WEATHERFLOW_CONFIG.FEELS_LIKE_MIN_DIFF &&
        obs[3] > WEATHERFLOW_CONFIG.HUMIDEX_MIN_HUMIDITY
      ) {
        weatherData.feelsLike = humidex;
      }
    }

    return weatherData;
  }

  /**
   * Process obs_sky message
   */
  private processObsSky(
    message: ObsSkyMessage,
    deviceId: number,
    stationLabel: string,
  ): WeatherData | null {
    if (!message.obs?.[0]) return null;

    const obs = message.obs[0];
    const weatherData: WeatherData = {
      uvIndex: obs[2], // UV Index
      illuminance: obs[1], // Illuminance (Lux)
      windLull: obs[4], // Wind Lull (m/s)
      windSpeed: obs[5], // Wind Avg (m/s)
      windGust: obs[6], // Wind Gust (m/s)
      windDirection: obs[7], // Wind Direction (degrees)
      solarRadiation: obs[10], // Solar Radiation (W/m^2)
      timestamp: obs[0], // Time Epoch
      device_id: deviceId,
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

    return weatherData;
  }

  /**
   * Process obs_st message (Tempest station)
   */
  private processObsSt(
    message: ObsStMessage,
    deviceId: number,
    stationLabel: string,
  ): WeatherData | null {
    if (!message.obs?.[0]) return null;

    const obs = message.obs[0];
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
      device_id: deviceId,
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

    // Track pressure history for barometric trend
    if (obs[6] !== undefined) {
      const pressureHistory = this.pressureHistories.get(deviceId) || [];
      pressureHistory.push(obs[6]);
      if (pressureHistory.length > WEATHERFLOW_CONFIG.PRESSURE_HISTORY_SIZE) {
        pressureHistory.shift(); // Keep only last N readings
      }
      this.pressureHistories.set(deviceId, pressureHistory);
      weatherData.barometricTrend = calculateBarometricTrend(pressureHistory);
    }

    // Calculate feels like temperature
    if (obs[7] !== undefined && obs[8] !== undefined) {
      const humidex = calculateHumidex(obs[7], obs[8]);
      const tempDiff = Math.abs(humidex - obs[7]);
      if (
        tempDiff > WEATHERFLOW_CONFIG.FEELS_LIKE_MIN_DIFF &&
        obs[8] > WEATHERFLOW_CONFIG.HUMIDEX_MIN_HUMIDITY
      ) {
        weatherData.feelsLike = humidex;
      }
    }

    return weatherData;
  }

  /**
   * Process rapid_wind message
   */
  private processRapidWind(
    message: RapidWindMessage,
    deviceId: number,
    stationLabel: string,
  ): WeatherData | null {
    if (!message.ob) return null;

    const obs = message.ob;
    return {
      windSpeed: obs[1], // Wind Speed (m/s)
      windDirection: obs[2], // Wind Direction (degrees)
      timestamp: obs[0], // Time Epoch
      device_id: deviceId,
      stationLabel,
    };
  }

  /**
   * Process event message and convert to WeatherEvent
   */
  processEvent(
    message: AnyWebSocketMessage,
    deviceId: number,
    stationLabel: string,
  ): WeatherEvent | null {
    switch (message.type) {
      case 'evt_strike':
        return this.processEvtStrike(message as EvtStrikeMessage, deviceId, stationLabel);
      case 'evt_precip':
        return this.processEvtPrecip(message as EvtPrecipMessage, deviceId, stationLabel);
      default:
        return null;
    }
  }

  /**
   * Process evt_strike message
   */
  private processEvtStrike(
    message: EvtStrikeMessage,
    deviceId: number,
    stationLabel: string,
  ): WeatherEvent {
    return {
      type: message.type,
      timestamp: message.evt[0],
      data: {
        distance: message.evt[1], // Distance (km)
        energy: message.evt[2], // Energy
        device_id: deviceId,
        stationLabel,
      },
    };
  }

  /**
   * Process evt_precip message
   */
  private processEvtPrecip(
    message: EvtPrecipMessage,
    deviceId: number,
    stationLabel: string,
  ): WeatherEvent {
    return {
      type: message.type,
      timestamp: Date.now() / 1000,
      data: {
        device_id: deviceId,
        stationLabel,
      },
    };
  }

  /**
   * Clean up pressure history for a device (when disconnected)
   */
  clearDeviceHistory(deviceId: number): void {
    this.pressureHistories.delete(deviceId);
  }

  /**
   * Clear all pressure histories
   */
  clearAllHistories(): void {
    this.pressureHistories.clear();
  }
}

