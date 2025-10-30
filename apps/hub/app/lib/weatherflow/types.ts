// Shared types for WeatherFlow Tempest API

export interface WeatherData {
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

export interface WeatherEvent {
  type: string;
  timestamp: number;
  data?: any;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface StationData {
  weatherData: WeatherData;
  connectionStatus: ConnectionStatus;
  lastUpdate: number | null;
}

// WebSocket message types from WeatherFlow API
export interface WebSocketMessage {
  type: string;
  device_id?: number;
  id?: string;
}

export interface AckMessage extends WebSocketMessage {
  type: 'ack';
}

export interface ObsAirMessage extends WebSocketMessage {
  type: 'obs_air';
  obs: Array<[
    number, // Time Epoch (seconds)
    number, // Station Pressure (MB)
    number, // Air Temperature (C)
    number, // Relative Humidity (%)
    number, // Lightning Strike Count
    number, // Lightning Strike Avg Distance (km)
    number, // Battery (Volts)
    number, // Report Interval (Minutes)
  ]>;
}

export interface ObsSkyMessage extends WebSocketMessage {
  type: 'obs_sky';
  obs: Array<[
    number, // Time Epoch (seconds)
    number, // Illuminance (Lux)
    number, // UV Index
    number, // Rain Accumulated (mm)
    number, // Wind Lull (m/s)
    number, // Wind Avg (m/s)
    number, // Wind Gust (m/s)
    number, // Wind Direction (degrees)
    number, // Battery (Volts)
    number, // Report Interval (Minutes)
    number, // Solar Radiation (W/m^2)
    number, // Local Daily Rain Accumulation (mm)
    number, // Precipitation Type (0=none, 1=rain, 2=hail)
    number, // Wind Sample Interval (seconds)
    number, // Rain Accumulated Final (Rain Check) (mm)
    number, // Local Daily Rain Accumulation Final (Rain Check) (mm)
    number, // Precipitation Analysis Type
  ]>;
}

export interface ObsStMessage extends WebSocketMessage {
  type: 'obs_st';
  obs: Array<[
    number, // Time Epoch (seconds)
    number, // Wind Lull (m/s)
    number, // Wind Avg (m/s)
    number, // Wind Gust (m/s)
    number, // Wind Direction (degrees)
    number, // Wind Sample Interval (seconds)
    number, // Station Pressure (MB)
    number, // Air Temperature (C)
    number, // Relative Humidity (%)
    number, // Illuminance (Lux)
    number, // UV Index
    number, // Solar Radiation (W/m^2)
    number, // Rain Accumulated (mm)
    number, // Precipitation Type (0=none, 1=rain, 2=hail)
    number, // Lightning Strike Avg Distance (km)
    number, // Lightning Strike Count
    number, // Battery (Volts)
    number, // Report Interval (Minutes)
    number, // Local Daily Rain Accumulation (mm)
    number | null, // Rain Accumulated Final (Rain Check) (mm)
    number | null, // Local Daily Rain Accumulation Final (Rain Check) (mm)
    number, // Precipitation Analysis Type
  ]>;
}

export interface RapidWindMessage extends WebSocketMessage {
  type: 'rapid_wind';
  ob: [
    number, // Time Epoch (seconds)
    number, // Wind Speed (m/s)
    number, // Wind Direction (degrees)
  ];
}

export interface EvtStrikeMessage extends WebSocketMessage {
  type: 'evt_strike';
  evt: [
    number, // Time Epoch (seconds)
    number, // Distance (km)
    number, // Energy
  ];
}

export interface EvtPrecipMessage extends WebSocketMessage {
  type: 'evt_precip';
}

export interface ListenStartMessage {
  type: 'listen_start';
  device_id: number;
  id: string;
}

export interface ListenStopMessage {
  type: 'listen_stop';
  device_id: number;
  id: string;
}

export type AnyWebSocketMessage =
  | AckMessage
  | ObsAirMessage
  | ObsSkyMessage
  | ObsStMessage
  | RapidWindMessage
  | EvtStrikeMessage
  | EvtPrecipMessage;

// API response types
export interface StationApiResponse {
  stations: Array<{
    station_id: number;
    station_name?: string;
    name?: string;
    public_name?: string;
    device_id?: number;
    device_type?: string;
    device_type_name?: string;
    serial_number?: string;
    devices?: Array<{
      device_id: number;
      device_type?: string;
      device_type_name?: string;
      serial_number?: string;
    }>;
  }>;
}

export interface ObservationsApiResponse {
  obs: Array<number[]>;
}

// Station mapping types
export interface StationMapping {
  deviceToStation: Map<number, string>; // device_id -> station name
  deviceToToken: Map<number, string>; // device_id -> token
  tokenToStations: Map<string, number[]>; // token -> station_ids[]
  stationIdToStation: Map<number, { name: string; deviceIds: number[]; token: string }>;
}

