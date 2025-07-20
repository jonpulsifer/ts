'use client';

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
  const windKmh = weatherData?.windSpeed
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
    <div className="p-2 h-screen overflow-hidden bg-gray-900 text-white flex flex-col">
      {/* Header with time and connection */}
      <div className="flex justify-between items-baseline mb-2">
        {/* Time */}
        <div className="flex items-baseline space-x-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div className="text-4xl font-mono font-bold text-white">
            {currentTime ? formatTime(currentTime) : '--:--:--'}
          </div>
        </div>

        {/* Date and Connection Status */}
        <div className="flex items-baseline space-x-4">
          <div className="text-2xl font-mono font-bold text-white">
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
              className={`text-sm capitalize ${
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
      <div className="flex-grow grid grid-rows-2 grid-cols-6 gap-2 pb-2">
        {/* Temperature */}
        <Card className="col-span-2 bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors flex flex-col">
          <CardContent className="p-2 flex flex-col justify-between items-center h-full text-center flex-grow">
            <Thermometer className="w-6 h-6 text-orange-400" />
            <div className="flex-grow flex flex-col justify-center items-center">
              <div className="text-6xl font-bold text-white">
                {tempC !== undefined ? tempC.toFixed(1) : '--'}
              </div>
              <div className="text-xl text-gray-300">°C</div>
              {feelsLike !== undefined &&
                tempC !== undefined &&
                Math.abs(feelsLike - tempC) > 2 && (
                  <div className="text-sm text-gray-400">
                    Feels like {feelsLike.toFixed(1)}°C
                  </div>
                )}
            </div>
            <div className="text-sm text-gray-500">Temperature</div>
          </CardContent>
        </Card>

        {/* Humidity */}
        <Card className="col-span-2 bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors flex flex-col">
          <CardContent className="p-2 flex flex-col justify-between items-center h-full text-center flex-grow">
            <Droplets className="w-6 h-6 text-blue-400" />
            <div className="flex-grow flex flex-col justify-center items-center">
              <div className="text-6xl font-bold text-white">
                {weatherData?.humidity ? weatherData.humidity.toFixed(0) : '--'}
              </div>
              <div className="text-xl text-gray-300">%</div>
            </div>
            <div className="text-sm text-gray-500">Humidity</div>
          </CardContent>
        </Card>

        {/* Wind Speed */}
        <Card className="col-span-2 bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors flex flex-col">
          <CardContent className="p-2 flex flex-col justify-between items-center h-full text-center flex-grow">
            <Wind className="w-6 h-6 text-gray-400" />
            <div className="flex-grow flex flex-col justify-center items-center">
              <div className="text-6xl font-bold text-white">
                {windKmh ? windKmh.toFixed(1) : '--'}
              </div>
              <div className="text-xl text-gray-300">km/h</div>
            </div>
            <div className="text-sm text-gray-500">Wind Speed</div>
          </CardContent>
        </Card>

        {/* Pressure */}
        <Card className="col-span-3 bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors flex flex-col">
          <CardContent className="p-2 flex flex-col justify-between items-center h-full text-center flex-grow">
            <Eye className="w-6 h-6 text-purple-400" />
            <div className="flex-grow flex flex-col justify-center items-center">
              <div className="text-6xl font-bold text-white flex items-center gap-1">
                {weatherData?.pressure
                  ? weatherData.pressure.toFixed(0)
                  : '--'}{' '}
                {getBarometricTrendIcon(barometricTrend)}
              </div>
              <div className="text-xl text-gray-300">mb</div>
            </div>
            <div className="text-sm text-gray-500">Pressure</div>
          </CardContent>
        </Card>

        {/* UV Index */}
        <Card className="col-span-3 bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors flex flex-col">
          <CardContent className="p-2 flex flex-col justify-between items-center h-full text-center flex-grow">
            <Sun className="w-6 h-6 text-yellow-400" />
            <div className="flex-grow flex flex-col justify-center items-center">
              <div className="text-6xl font-bold text-white">
                {weatherData?.uvIndex ? weatherData.uvIndex.toFixed(1) : '--'}
              </div>
              <div className="text-xl text-gray-300">UV Index</div>
              <div className="text-sm text-gray-500">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
