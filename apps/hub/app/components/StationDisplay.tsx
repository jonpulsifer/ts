import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CloudRain,
  Compass,
  Droplets,
  Eye,
  Sun,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react';
import type {
  ConnectionStatus,
  WeatherData,
  WebSocketState,
} from '~/lib/weatherflow/types';

interface StationDisplayProps {
  stationLabel: string;
  weatherData: WeatherData;
  connectionStatus: ConnectionStatus;
  lastUpdate: number | null;
  isSingleStation?: boolean;
  isDiff?: boolean; // If true, this is showing differences
  websocketStatus?: WebSocketState;
  sseStatus?: 'connected' | 'connecting' | 'disconnected';
}

export function StationDisplay({
  stationLabel,
  weatherData,
  connectionStatus: _connectionStatus,
  lastUpdate,
  isSingleStation = false,
  isDiff = false,
  websocketStatus,
  sseStatus,
}: StationDisplayProps) {
  const tempC = weatherData?.temperature;
  const feelsLike = weatherData?.feelsLike;
  const windAvgKmh =
    weatherData?.windSpeed != null ? weatherData.windSpeed * 3.6 : undefined;
  const windLullKmh =
    weatherData?.windLull != null ? weatherData.windLull * 3.6 : undefined;
  const windGustKmh =
    weatherData?.windGust != null ? weatherData.windGust * 3.6 : undefined;
  const windDirection = weatherData?.windDirection;
  const barometricTrend = weatherData?.barometricTrend || 'steady';

  const getBarometricTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'falling':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      default:
        return <ArrowRight className="w-4 h-4 text-gray-400" />;
    }
  };

  const getWindDirectionLabel = (degrees?: number): string => {
    if (degrees === undefined || degrees === null) return '--';
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return `${directions[index]} ${degrees.toFixed(0)}°`;
  };

  const getStatusColor = (status: WebSocketState | string) => {
    switch (status) {
      case 'connected':
        return 'text-green-400';
      case 'connecting':
      case 'reconnecting':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSseStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-400';
      case 'connecting':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const wsStatus = websocketStatus || 'disconnected';
  const displaySseStatus = sseStatus || 'disconnected';

  return (
    <div
      className={`flex flex-col h-full border-r border-gray-700 last:border-r-0 overflow-hidden ${isDiff ? 'flex-[0.5]' : 'flex-1'}`}
    >
      {/* Station Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-700 flex-shrink-0 h-[2.25rem]">
        {isDiff ? (
          <div className="flex items-center justify-center gap-2 text-xs w-full">
            <span className="text-gray-300 font-bold text-base whitespace-nowrap">
              {stationLabel}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 text-xs w-full">
            <div className="flex items-center gap-2">
              <span className="text-gray-300 font-bold text-base whitespace-nowrap">
                {stationLabel}
              </span>
              {lastUpdate && (
                <span className="text-gray-500 text-[10px]">
                  {new Date(lastUpdate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border border-gray-700 bg-gray-800/50"
                title={`WebSocket: ${wsStatus}`}
              >
                <span className="text-gray-500">WS</span>
                <span className={`${getStatusColor(wsStatus)} text-[10px]`}>
                  {wsStatus === 'connected'
                    ? '●'
                    : wsStatus === 'reconnecting'
                      ? '↻'
                      : wsStatus === 'connecting'
                        ? '···'
                        : wsStatus === 'error'
                          ? '!'
                          : '○'}
                </span>
              </div>
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border border-gray-700 bg-gray-800/50"
                title={`Server-Sent Events: ${displaySseStatus}`}
              >
                <span className="text-gray-500">SSE</span>
                <span
                  className={`${getSseStatusColor(displaySseStatus)} text-[10px]`}
                >
                  {displaySseStatus === 'connected'
                    ? '●'
                    : displaySseStatus === 'connecting'
                      ? '···'
                      : '○'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weather Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Temperature - Large */}
        <div className="flex flex-col items-center justify-center py-1 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center">
            <Thermometer className="w-4 h-4 text-orange-400 mr-2" />
            <div
              className={`text-4xl font-bold ${
                isDiff
                  ? tempC !== undefined && tempC > 0
                    ? 'text-red-400'
                    : tempC !== undefined && tempC < 0
                      ? 'text-blue-400'
                      : 'text-white'
                  : 'text-white'
              }`}
            >
              {tempC !== undefined
                ? isDiff
                  ? `${tempC > 0 ? '+' : ''}${tempC.toFixed(1)}`
                  : tempC.toFixed(1)
                : '--'}
              °
            </div>
          </div>
          <div className="h-3 flex items-center justify-center">
            {feelsLike && Math.abs(feelsLike - (tempC || 0)) > 2 && !isDiff ? (
              <div className="text-xs text-gray-400">
                Feels like {feelsLike.toFixed(1)}°
              </div>
            ) : weatherData?.minMax24h &&
              (weatherData.minMax24h.tempMin !== undefined ||
                weatherData.minMax24h.tempMax !== undefined) ? (
              <div className="text-xs text-gray-500">
                {isDiff
                  ? weatherData.minMax24h.tempMin !== undefined &&
                    weatherData.minMax24h.tempMax !== undefined
                    ? `${weatherData.minMax24h.tempMin > 0 ? '+' : ''}${weatherData.minMax24h.tempMin.toFixed(1)}° / ${weatherData.minMax24h.tempMax > 0 ? '+' : ''}${weatherData.minMax24h.tempMax.toFixed(1)}°`
                    : weatherData.minMax24h.tempMax !== undefined
                      ? `${weatherData.minMax24h.tempMax > 0 ? '+' : ''}${weatherData.minMax24h.tempMax.toFixed(1)}°`
                      : weatherData.minMax24h.tempMin !== undefined
                        ? `${weatherData.minMax24h.tempMin > 0 ? '+' : ''}${weatherData.minMax24h.tempMin.toFixed(1)}°`
                        : '-- --'
                  : weatherData.minMax24h.tempMin !== undefined &&
                      weatherData.minMax24h.tempMax !== undefined
                    ? `${weatherData.minMax24h.tempMin.toFixed(1)}° / ${weatherData.minMax24h.tempMax.toFixed(1)}°`
                    : weatherData.minMax24h.tempMax !== undefined
                      ? `Max: ${weatherData.minMax24h.tempMax.toFixed(1)}°`
                      : `Min: ${weatherData.minMax24h.tempMin?.toFixed(1)}°`}
              </div>
            ) : null}
          </div>
        </div>

        {/* Weather Details Grid - 2x2 when single station, single column when multiple */}
        <div
          className={`flex-1 overflow-hidden min-h-0 ${isSingleStation ? 'grid grid-cols-2' : 'flex flex-col'}`}
        >
          {/* Humidity */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0 min-h-[1.75rem]`}
          >
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              {!isDiff && (
                <span className="text-sm text-gray-400">Humidity</span>
              )}
            </div>
            <div className="flex flex-col items-end min-h-[1.75rem] justify-center">
              <div
                className={`text-lg font-bold ${
                  isDiff && weatherData?.humidity !== undefined
                    ? weatherData.humidity > 0
                      ? 'text-red-400'
                      : weatherData.humidity < 0
                        ? 'text-blue-400'
                        : 'text-white'
                    : 'text-white'
                }`}
              >
                {weatherData?.humidity !== undefined
                  ? isDiff
                    ? `${weatherData.humidity > 0 ? '+' : ''}${weatherData.humidity.toFixed(0)}`
                    : weatherData.humidity.toFixed(0)
                  : '--'}
                %
              </div>
              {(weatherData?.minMax24h &&
                (weatherData.minMax24h.humidityMin !== undefined ||
                  weatherData.minMax24h.humidityMax !== undefined)) ||
              isDiff ? (
                <div className="text-xs text-gray-500">
                  {isDiff
                    ? weatherData.minMax24h &&
                      weatherData.minMax24h.humidityMin !== undefined &&
                      weatherData.minMax24h.humidityMax !== undefined
                      ? `${weatherData.minMax24h.humidityMin > 0 ? '+' : ''}${weatherData.minMax24h.humidityMin.toFixed(0)}-${weatherData.minMax24h.humidityMax > 0 ? '+' : ''}${weatherData.minMax24h.humidityMax.toFixed(0)}%`
                      : weatherData.minMax24h &&
                          weatherData.minMax24h.humidityMax !== undefined
                        ? `${weatherData.minMax24h.humidityMax > 0 ? '+' : ''}${weatherData.minMax24h.humidityMax.toFixed(0)}%`
                        : weatherData.minMax24h &&
                            weatherData.minMax24h.humidityMin !== undefined
                          ? `${weatherData.minMax24h.humidityMin > 0 ? '+' : ''}${weatherData.minMax24h.humidityMin.toFixed(0)}%`
                          : '-- --'
                    : weatherData.minMax24h &&
                        weatherData.minMax24h.humidityMin !== undefined &&
                        weatherData.minMax24h.humidityMax !== undefined
                      ? `${weatherData.minMax24h.humidityMin.toFixed(0)}-${weatherData.minMax24h.humidityMax.toFixed(0)}%`
                      : weatherData.minMax24h &&
                          weatherData.minMax24h.humidityMax !== undefined
                        ? `Max: ${weatherData.minMax24h.humidityMax.toFixed(0)}%`
                        : weatherData.minMax24h &&
                            weatherData.minMax24h.humidityMin !== undefined
                          ? `Min: ${weatherData.minMax24h.humidityMin.toFixed(0)}%`
                          : '-- --'}
                </div>
              ) : null}
            </div>
          </div>

          {/* Wind - Avg */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0 min-h-[1.75rem]`}
          >
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-400" />
              {!isDiff && (
                <span className="text-sm text-gray-400">Wind Avg</span>
              )}
            </div>
            <div className="flex flex-col items-end min-h-[1.75rem] justify-center">
              <div
                className={`text-lg font-bold ${
                  isDiff && windAvgKmh != null
                    ? windAvgKmh > 0
                      ? 'text-red-400'
                      : windAvgKmh < 0
                        ? 'text-blue-400'
                        : 'text-white'
                    : 'text-white'
                }`}
              >
                {windAvgKmh != null && windAvgKmh !== 0
                  ? isDiff
                    ? `${windAvgKmh > 0 ? '+' : ''}${windAvgKmh.toFixed(1)} km/h`
                    : `${windAvgKmh.toFixed(1)} km/h`
                  : windAvgKmh === 0 && isDiff
                    ? '0 km/h'
                    : 'Windless'}
              </div>
              {(weatherData?.minMax24h &&
                weatherData.minMax24h.windSpeedMax !== undefined) ||
              isDiff ? (
                <div className="text-xs text-gray-500">
                  {isDiff
                    ? weatherData.minMax24h &&
                      weatherData.minMax24h.windSpeedMax !== undefined
                      ? `${weatherData.minMax24h.windSpeedMax > 0 ? '+' : ''}${(weatherData.minMax24h.windSpeedMax * 3.6).toFixed(1)} km/h`
                      : '-- --'
                    : weatherData.minMax24h &&
                        weatherData.minMax24h.windSpeedMax !== undefined
                      ? `Max: ${(weatherData.minMax24h.windSpeedMax * 3.6).toFixed(1)} km/h`
                      : '-- --'}
                </div>
              ) : null}
            </div>
          </div>

          {/* Pressure */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0 min-h-[1.75rem]`}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              {!isDiff && (
                <span className="text-sm text-gray-400">Pressure</span>
              )}
            </div>
            <div className="flex flex-col items-end min-h-[1.75rem] justify-center">
              <div className="flex items-center gap-2">
                <span
                  className={`text-lg font-bold ${
                    isDiff && weatherData?.pressure !== undefined
                      ? weatherData.pressure > 0
                        ? 'text-red-400'
                        : weatherData.pressure < 0
                          ? 'text-blue-400'
                          : 'text-white'
                      : 'text-white'
                  }`}
                >
                  {weatherData?.pressure !== undefined
                    ? isDiff
                      ? `${weatherData.pressure > 0 ? '+' : ''}${weatherData.pressure.toFixed(0)}`
                      : weatherData.pressure.toFixed(0)
                    : '--'}
                </span>
                <span className="text-xs text-gray-500">mb</span>
                {!isDiff && getBarometricTrendIcon(barometricTrend)}
              </div>
              {(weatherData?.minMax24h &&
                (weatherData.minMax24h.pressureMin !== undefined ||
                  weatherData.minMax24h.pressureMax !== undefined)) ||
              isDiff ? (
                <div className="text-xs text-gray-500">
                  {isDiff
                    ? weatherData.minMax24h &&
                      weatherData.minMax24h.pressureMin !== undefined &&
                      weatherData.minMax24h.pressureMax !== undefined
                      ? `${weatherData.minMax24h.pressureMin > 0 ? '+' : ''}${weatherData.minMax24h.pressureMin.toFixed(0)}-${weatherData.minMax24h.pressureMax > 0 ? '+' : ''}${weatherData.minMax24h.pressureMax.toFixed(0)} mb`
                      : weatherData.minMax24h &&
                          weatherData.minMax24h.pressureMax !== undefined
                        ? `${weatherData.minMax24h.pressureMax > 0 ? '+' : ''}${weatherData.minMax24h.pressureMax.toFixed(0)} mb`
                        : weatherData.minMax24h &&
                            weatherData.minMax24h.pressureMin !== undefined
                          ? `${weatherData.minMax24h.pressureMin > 0 ? '+' : ''}${weatherData.minMax24h.pressureMin.toFixed(0)} mb`
                          : '-- --'
                    : weatherData.minMax24h &&
                        weatherData.minMax24h.pressureMin !== undefined &&
                        weatherData.minMax24h.pressureMax !== undefined
                      ? `${weatherData.minMax24h.pressureMin.toFixed(0)}-${weatherData.minMax24h.pressureMax.toFixed(0)} mb`
                      : weatherData.minMax24h &&
                          weatherData.minMax24h.pressureMax !== undefined
                        ? `Max: ${weatherData.minMax24h.pressureMax.toFixed(0)} mb`
                        : weatherData.minMax24h &&
                            weatherData.minMax24h.pressureMin !== undefined
                          ? `Min: ${weatherData.minMax24h.pressureMin.toFixed(0)} mb`
                          : '-- --'}
                </div>
              ) : null}
            </div>
          </div>

          {/* Rain */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0 min-h-[1.75rem]`}
          >
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-400" />
              {!isDiff && <span className="text-sm text-gray-400">Rain</span>}
            </div>
            <div className="flex flex-col items-end min-h-[1.75rem] justify-center">
              {weatherData?.rainTotal !== undefined &&
              weatherData.rainTotal !== null ? (
                <>
                  <div
                    className={`text-lg font-bold ${
                      isDiff
                        ? weatherData.rainTotal > 0
                          ? 'text-red-400'
                          : weatherData.rainTotal < 0
                            ? 'text-blue-400'
                            : 'text-white'
                        : 'text-white'
                    }`}
                  >
                    {isDiff
                      ? `${weatherData.rainTotal > 0 ? '+' : ''}${weatherData.rainTotal.toFixed(1)} mm`
                      : `${weatherData.rainTotal.toFixed(1)} mm`}
                  </div>
                  {weatherData?.rainDuration !== undefined &&
                    weatherData.rainDuration !== null &&
                    weatherData.rainDuration > 0 && (
                      <div className="text-xs text-gray-500">
                        {Math.floor(weatherData.rainDuration / 60)}h{' '}
                        {weatherData.rainDuration % 60}m
                      </div>
                    )}
                </>
              ) : (
                <div className="text-lg font-bold text-gray-500">--</div>
              )}
            </div>
          </div>

          {/* UV Index */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0 min-h-[1.75rem]`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              {!isDiff && <span className="text-sm text-gray-400">UV</span>}
            </div>
            <div className="flex flex-col items-end min-h-[1.75rem] justify-center">
              <div
                className={`text-lg font-bold ${
                  isDiff &&
                  weatherData?.uvIndex !== undefined &&
                  weatherData.uvIndex !== null
                    ? weatherData.uvIndex > 0
                      ? 'text-red-400'
                      : weatherData.uvIndex < 0
                        ? 'text-blue-400'
                        : 'text-white'
                    : 'text-white'
                }`}
              >
                {weatherData?.uvIndex !== undefined &&
                weatherData.uvIndex !== null
                  ? isDiff
                    ? `${weatherData.uvIndex > 0 ? '+' : ''}${weatherData.uvIndex.toFixed(1)}`
                    : weatherData.uvIndex.toFixed(1)
                  : '--'}
              </div>
              {(weatherData?.minMax24h &&
                weatherData.minMax24h.uvIndexMax !== undefined) ||
              isDiff ? (
                <div className="text-xs text-gray-500">
                  {isDiff
                    ? weatherData.minMax24h &&
                      weatherData.minMax24h.uvIndexMax !== undefined
                      ? `${weatherData.minMax24h.uvIndexMax > 0 ? '+' : ''}${weatherData.minMax24h.uvIndexMax.toFixed(1)}`
                      : '-- --'
                    : weatherData.minMax24h &&
                        weatherData.minMax24h.uvIndexMax !== undefined
                      ? `Max: ${weatherData.minMax24h.uvIndexMax.toFixed(1)}`
                      : '-- --'}
                </div>
              ) : null}
            </div>
          </div>

          {/* Wind - Lull - Always render for alignment */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0 min-h-[1.75rem]`}
          >
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-500" />
              {!isDiff && (
                <span className="text-sm text-gray-500">Wind Lull</span>
              )}
            </div>
            <div
              className={`text-lg font-semibold ${
                windLullKmh !== undefined
                  ? isDiff
                    ? windLullKmh > 0
                      ? 'text-red-400'
                      : windLullKmh < 0
                        ? 'text-blue-400'
                        : 'text-gray-300'
                    : 'text-gray-300'
                  : 'text-gray-500'
              }`}
            >
              {windLullKmh !== undefined
                ? isDiff
                  ? `${windLullKmh > 0 ? '+' : ''}${windLullKmh.toFixed(1)} km/h`
                  : `${windLullKmh.toFixed(1)} km/h`
                : '--'}
            </div>
          </div>

          {/* Wind - Gust - Always render for alignment */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0 min-h-[1.75rem]`}
          >
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-500" />
              {!isDiff && (
                <span className="text-sm text-gray-500">Wind Gust</span>
              )}
            </div>
            <div
              className={`text-lg font-semibold ${
                windGustKmh !== undefined
                  ? isDiff
                    ? windGustKmh > 0
                      ? 'text-red-400'
                      : windGustKmh < 0
                        ? 'text-blue-400'
                        : 'text-gray-300'
                    : 'text-gray-300'
                  : 'text-gray-500'
              }`}
            >
              {windGustKmh !== undefined
                ? isDiff
                  ? `${windGustKmh > 0 ? '+' : ''}${windGustKmh.toFixed(1)} km/h`
                  : `${windGustKmh.toFixed(1)} km/h`
                : '--'}
            </div>
          </div>

          {/* Wind Direction - Always render for alignment */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0 min-h-[1.75rem]`}
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-gray-400" />
              {!isDiff && (
                <span className="text-sm text-gray-400">Direction</span>
              )}
            </div>
            <div className="text-lg font-semibold text-white">
              {windDirection !== undefined
                ? getWindDirectionLabel(windDirection)
                : '--'}
            </div>
          </div>

          {/* Solar Radiation - Always render for alignment */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0 min-h-[1.75rem]`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-300" />
              {!isDiff && <span className="text-sm text-gray-400">Solar</span>}
            </div>
            <div
              className={`text-lg font-semibold ${
                weatherData?.solarRadiation !== undefined &&
                weatherData.solarRadiation !== null
                  ? isDiff
                    ? weatherData.solarRadiation > 0
                      ? 'text-red-400'
                      : weatherData.solarRadiation < 0
                        ? 'text-blue-400'
                        : 'text-white'
                    : 'text-white'
                  : 'text-gray-500'
              }`}
            >
              {weatherData?.solarRadiation !== undefined &&
              weatherData.solarRadiation !== null
                ? isDiff
                  ? `${weatherData.solarRadiation > 0 ? '+' : ''}${weatherData.solarRadiation.toFixed(0)} W/m²`
                  : `${weatherData.solarRadiation.toFixed(0)} W/m²`
                : '--'}
            </div>
          </div>

          {/* Illuminance - Always render for alignment */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0 min-h-[1.75rem]`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-gray-500" />
              {!isDiff && <span className="text-sm text-gray-500">Light</span>}
            </div>
            <div
              className={`text-lg font-semibold ${
                weatherData?.illuminance !== undefined &&
                weatherData.illuminance !== null
                  ? isDiff
                    ? weatherData.illuminance > 0
                      ? 'text-red-400'
                      : weatherData.illuminance < 0
                        ? 'text-blue-400'
                        : 'text-gray-300'
                    : 'text-gray-300'
                  : 'text-gray-500'
              }`}
            >
              {weatherData?.illuminance !== undefined &&
              weatherData.illuminance !== null
                ? isDiff
                  ? `${weatherData.illuminance > 0 ? '+' : ''}${weatherData.illuminance.toFixed(0)} lux`
                  : `${weatherData.illuminance.toFixed(0)} lux`
                : '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
