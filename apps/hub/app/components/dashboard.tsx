import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Clock,
  Droplets,
  Eye,
  Sun,
  Thermometer,
  Wifi,
  Wind,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '~/components/ui/card';
import { useWeatherSocket } from '~/hooks/use-weather-socket';

export default function Dashboard() {
  const { weatherData, lastUpdate, connectionStatus } = useWeatherSocket();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Update current time every second, only on the client
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Keep temperature in Celsius (no conversion needed)
  const tempC = weatherData?.temperature;
  const feelsLike = weatherData?.feelsLike;

  // Convert wind speed from m/s to km/h
  const windKmh =
    weatherData?.windSpeed != null
      ? weatherData.windSpeed * 3.6
      : undefined;

  // Get barometric trend
  const barometricTrend = weatherData?.barometricTrend || 'steady';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get barometric trend icon and color
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

  // Debug: Log the raw temperature value
  useEffect(() => {
    if (weatherData?.temperature !== undefined) {
      console.log('Raw temperature from API:', weatherData.temperature);
      console.log('Full weather data:', weatherData);
    }
  }, [weatherData]);

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header with time and connection */}
      <div className="flex justify-between items-center mb-4">
        {/* Time */}
        <div className="flex items-baseline space-x-2">
          <Clock className="w-6 h-6 text-gray-400" />
          <div className="text-3xl font-mono font-bold text-white">
            {currentTime ? formatTime(currentTime) : '--:--:--'}
          </div>
        </div>

        {/* Date and Connection Status */}
        <div className="flex items-baseline space-x-4">
          <div className="text-xl font-mono font-bold text-white">
            {currentTime
              ? `${formatDate(currentTime)} ${currentTime.getFullYear()}`
              : '---, --- --'}
          </div>
          <div className="flex items-center space-x-2">
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
            <span
              className={`text-xs capitalize ${
                connectionStatus === 'connected'
                  ? 'text-green-400'
                  : connectionStatus === 'connecting'
                    ? 'text-yellow-400'
                    : connectionStatus === 'error'
                      ? 'text-red-400'
                      : 'text-gray-400'
              }`}
            >
              {lastUpdate
                ? `Updated: ${new Date(lastUpdate).toLocaleTimeString()}`
                : connectionStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Weather Grid */}
      <div className="flex-grow grid grid-cols-3 grid-rows-2 gap-4">
        {/* Temperature & Humidity */}
        <Card className="col-span-1 row-span-2 bg-gray-800 border-gray-700 flex flex-col p-4">
          <div className="flex-grow flex flex-col justify-center items-center text-center">
            <Thermometer className="w-8 h-8 text-orange-400" />
            <div className="text-7xl font-bold text-white mt-2">
              {tempC !== undefined ? tempC.toFixed(1) : '--'}°C
            </div>
            {feelsLike !== undefined &&
              tempC !== undefined &&
              Math.abs(feelsLike - tempC) > 2 && (
                <div className="text-lg text-gray-400">
                  Feels like {feelsLike.toFixed(1)}°C
                </div>
              )}
          </div>
          <div className="flex-grow flex flex-col justify-center items-center text-center mt-4">
            <Droplets className="w-8 h-8 text-blue-400" />
            <div className="text-5xl font-bold text-white mt-2">
              {weatherData?.humidity ? weatherData.humidity.toFixed(0) : '--'}%
            </div>
            <div className="text-md text-gray-500">Humidity</div>
          </div>
        </Card>

        {/* Wind Speed */}
        <Card className="col-span-2 bg-gray-800 border-gray-700 flex flex-col p-4">
          <div className="flex-grow flex flex-col justify-center items-center text-center">
            <Wind className="w-8 h-8 text-gray-400" />
            {windKmh != null && windKmh > 0 ? (
              <>
                <div className="text-6xl font-bold text-white mt-2">
                  {windKmh.toFixed(1)}
                </div>
                <div className="text-xl text-gray-300">km/h</div>
              </>
            ) : (
              <div className="text-4xl font-bold text-white mt-2">
                Windless™
              </div>
            )}
            <div className="text-md text-gray-500 mt-auto">Wind Speed</div>
          </div>
        </Card>

        {/* Pressure */}
        <Card className="col-span-1 bg-gray-800 border-gray-700 flex flex-col p-4">
          <div className="flex-grow flex flex-col justify-center items-center text-center">
            <Eye className="w-8 h-8 text-purple-400" />
            <div className="text-4xl font-bold text-white mt-2 flex items-center gap-1">
              {weatherData?.pressure
                ? weatherData.pressure.toFixed(0)
                : '--'}{' '}
              {getBarometricTrendIcon(barometricTrend)}
            </div>
            <div className="text-lg text-gray-300">mb</div>
            <div className="text-md text-gray-500 mt-auto">Pressure</div>
          </div>
        </Card>

        {/* UV Index */}
        <Card className="col-span-1 bg-gray-800 border-gray-700 flex flex-col p-4">
          <div className="flex-grow flex flex-col justify-center items-center text-center">
            <Sun className="w-8 h-8 text-yellow-400" />
            <div className="text-4xl font-bold text-white mt-2">
              {weatherData?.uvIndex ? weatherData.uvIndex.toFixed(1) : '--'}
            </div>
            <div className="text-lg text-gray-300">UV Index</div>
            <div className="text-md text-gray-500 mt-auto">
              {weatherData?.uvIndex
                ? weatherData.uvIndex <= 2
                  ? 'Low'
                  : weatherData.uvIndex <= 5
                    ? 'Moderate'
                    : weatherData.uvIndex <= 7
                      ? 'High'
                      : weatherData.uvIndex <= 10
                        ? 'Very High'
                        : 'Extreme'
                : ''}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
