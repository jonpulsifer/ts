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
  Wifi,
  Wind,
  Zap,
} from 'lucide-react';
import type { WeatherData, ConnectionStatus } from '~/lib/weatherflow/types';

interface StationDisplayProps {
  stationLabel: string;
  weatherData: WeatherData;
  connectionStatus: ConnectionStatus;
  lastUpdate: number | null;
  isSingleStation?: boolean;
}

export function StationDisplay({
  stationLabel,
  weatherData,
  connectionStatus,
  lastUpdate,
  isSingleStation = false,
}: StationDisplayProps) {
  const tempC = weatherData?.temperature;
  const feelsLike = weatherData?.feelsLike;
  const windAvgKmh = weatherData?.windSpeed != null ? weatherData.windSpeed * 3.6 : undefined;
  const windLullKmh = weatherData?.windLull != null ? weatherData.windLull * 3.6 : undefined;
  const windGustKmh = weatherData?.windGust != null ? weatherData.windGust * 3.6 : undefined;
  const windDirection = weatherData?.windDirection;
  const barometricTrend = weatherData?.barometricTrend || 'steady';

  // Determine if it's dark outside
  // Typically < 1000 lux means it's dark (twilight/dark), < 100 lux is very dark
  const isDark =
    (weatherData?.illuminance !== undefined && weatherData.illuminance < 1000) ||
    (weatherData?.uvIndex === undefined ||
      weatherData.uvIndex === null ||
      weatherData.uvIndex === 0);

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

  return (
    <div className="flex flex-col h-full border-r border-gray-700 last:border-r-0 flex-1 overflow-hidden">
      {/* Station Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-700 flex-shrink-0">
        <div className="text-xl font-bold text-white">{stationLabel}</div>
        <div className="flex items-center gap-2">
          <Wifi
            className={`w-4 h-4 ${
              connectionStatus === 'connected'
                ? 'text-green-400'
                : connectionStatus === 'connecting'
                  ? 'text-yellow-400'
                  : connectionStatus === 'error'
                    ? 'text-red-400'
                    : 'text-gray-400'
            }`}
          />
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              {new Date(lastUpdate).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>

      {/* Weather Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Temperature - Large */}
        <div className="flex flex-col items-center justify-center py-1 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center">
            <Thermometer className="w-4 h-4 text-orange-400 mr-2" />
            <div className="text-4xl font-bold text-white">
              {tempC !== undefined ? tempC.toFixed(1) : '--'}°
            </div>
          </div>
          {feelsLike && Math.abs(feelsLike - (tempC || 0)) > 2 && (
            <div className="text-xs text-gray-400">
              Feels like {feelsLike.toFixed(1)}°
            </div>
          )}
          {weatherData?.minMax24h &&
            (weatherData.minMax24h.tempMin !== undefined ||
              weatherData.minMax24h.tempMax !== undefined) && (
              <div className="text-xs text-gray-500">
                {weatherData.minMax24h.tempMin !== undefined &&
                weatherData.minMax24h.tempMax !== undefined
                  ? `${weatherData.minMax24h.tempMin.toFixed(1)}° / ${weatherData.minMax24h.tempMax.toFixed(1)}°`
                  : weatherData.minMax24h.tempMax !== undefined
                    ? `Max: ${weatherData.minMax24h.tempMax.toFixed(1)}°`
                    : `Min: ${weatherData.minMax24h.tempMin?.toFixed(1)}°`}
              </div>
            )}
        </div>

        {/* Weather Details Grid - 2x2 when single station, single column when multiple */}
        <div
          className={`flex-1 overflow-hidden min-h-0 ${isSingleStation ? 'grid grid-cols-2' : 'flex flex-col'}`}
        >
          {/* Humidity */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}
          >
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Humidity</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-lg font-bold text-white">
                {weatherData?.humidity ? weatherData.humidity.toFixed(0) : '--'}%
              </div>
              {weatherData?.minMax24h &&
                (weatherData.minMax24h.humidityMin !== undefined ||
                  weatherData.minMax24h.humidityMax !== undefined) && (
                  <div className="text-xs text-gray-500">
                    {weatherData.minMax24h.humidityMin !== undefined &&
                    weatherData.minMax24h.humidityMax !== undefined
                      ? `${weatherData.minMax24h.humidityMin.toFixed(0)}-${weatherData.minMax24h.humidityMax.toFixed(0)}%`
                      : weatherData.minMax24h.humidityMax !== undefined
                        ? `Max: ${weatherData.minMax24h.humidityMax.toFixed(0)}%`
                        : `Min: ${weatherData.minMax24h.humidityMin?.toFixed(0)}%`}
                  </div>
                )}
            </div>
          </div>

          {/* Wind - Avg */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}
          >
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Wind Avg</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-lg font-bold text-white">
                {windAvgKmh != null && windAvgKmh > 0
                  ? `${windAvgKmh.toFixed(1)} km/h`
                  : 'Windless'}
              </div>
              {weatherData?.minMax24h &&
                weatherData.minMax24h.windSpeedMax !== undefined && (
                  <div className="text-xs text-gray-500">
                    Max: {(weatherData.minMax24h.windSpeedMax * 3.6).toFixed(1)} km/h
                  </div>
                )}
            </div>
          </div>

          {/* Pressure */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Pressure</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">
                  {weatherData?.pressure ? weatherData.pressure.toFixed(0) : '--'}
                </span>
                <span className="text-xs text-gray-500">mb</span>
                {getBarometricTrendIcon(barometricTrend)}
              </div>
              {weatherData?.minMax24h &&
                (weatherData.minMax24h.pressureMin !== undefined ||
                  weatherData.minMax24h.pressureMax !== undefined) && (
                  <div className="text-xs text-gray-500">
                    {weatherData.minMax24h.pressureMin !== undefined &&
                    weatherData.minMax24h.pressureMax !== undefined
                      ? `${weatherData.minMax24h.pressureMin.toFixed(0)}-${weatherData.minMax24h.pressureMax.toFixed(0)} mb`
                      : weatherData.minMax24h.pressureMax !== undefined
                        ? `Max: ${weatherData.minMax24h.pressureMax.toFixed(0)} mb`
                        : `Min: ${weatherData.minMax24h.pressureMin?.toFixed(0)} mb`}
                  </div>
                )}
            </div>
          </div>

          {/* UV Index */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-400">UV</span>
            </div>
            <div className="flex flex-col items-end">
              <div
                className={`font-bold text-white ${!isDark ? 'text-lg' : 'text-sm'}`}
              >
                {isDark
                  ? "IT'S NIGHT TIME"
                  : weatherData?.uvIndex !== undefined && weatherData.uvIndex !== null
                    ? weatherData.uvIndex.toFixed(1)
                    : "IT'S NIGHT TIME"}
              </div>
              {weatherData?.minMax24h &&
                weatherData.minMax24h.uvIndexMax !== undefined && (
                  <div className="text-xs text-gray-500">
                    Max: {weatherData.minMax24h.uvIndexMax.toFixed(1)}
                  </div>
                )}
            </div>
          </div>

          {/* Wind - Lull */}
          {windLullKmh !== undefined && (
            <div
              className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}
            >
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Wind Lull</span>
              </div>
              <div className="text-lg font-semibold text-gray-300">
                {windLullKmh.toFixed(1)} km/h
              </div>
            </div>
          )}

          {/* Wind - Gust */}
          {windGustKmh !== undefined && (
            <div
              className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}
            >
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Wind Gust</span>
              </div>
              <div className="text-lg font-semibold text-gray-300">
                {windGustKmh.toFixed(1)} km/h
              </div>
            </div>
          )}

          {/* Wind Direction */}
          {windDirection !== undefined && (
            <div
              className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Direction</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {getWindDirectionLabel(windDirection)}
              </div>
            </div>
          )}

          {/* Solar Radiation */}
          {weatherData?.solarRadiation !== undefined &&
            weatherData.solarRadiation !== null && (
              <div
                className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm text-gray-400">Solar</span>
                </div>
                <div className="text-lg font-semibold text-white">
                  {weatherData.solarRadiation.toFixed(0)} W/m²
                </div>
              </div>
            )}

          {/* Illuminance */}
          {weatherData?.illuminance !== undefined &&
            weatherData.illuminance !== null && (
              <div
                className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Light</span>
                </div>
                <div className="text-lg font-semibold text-gray-300">
                  {weatherData.illuminance.toFixed(0)} lux
                </div>
              </div>
            )}

          {/* Rain */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}
          >
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Rain</span>
            </div>
            <div className="flex flex-col items-end">
              {weatherData?.rainTotal !== undefined &&
              weatherData.rainTotal !== null ? (
                <>
                  <div className="text-lg font-bold text-white">
                    {weatherData.rainTotal.toFixed(1)} mm
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
        </div>
      </div>
    </div>
  );
}

