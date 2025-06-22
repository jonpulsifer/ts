'use client';

import {
  Calendar,
  Clock,
  Droplets,
  Eye,
  Thermometer,
  Wifi,
  Wind,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '~/components/ui/card';
import { useWeatherSocket } from '~/hooks/use-weather-socket';

export default function Dashboard() {
  const { weatherData, lastUpdate, connectionStatus } = useWeatherSocket();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Keep temperature in Celsius (no conversion needed)
  const tempC = weatherData?.temperature;

  // Convert wind speed from m/s to km/h
  const windKmh = weatherData?.windSpeed
    ? weatherData.windSpeed * 3.6
    : undefined;

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

  // Debug: Log the raw temperature value
  useEffect(() => {
    if (weatherData?.temperature !== undefined) {
      console.log('Raw temperature from API:', weatherData.temperature);
      console.log('Full weather data:', weatherData);
    }
  }, [weatherData]);

  return (
    <div className="p-2 h-screen overflow-hidden bg-gray-900 text-white">
      {/* Header with time and connection */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <div className="text-2xl font-mono font-bold text-white">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-gray-400">
              {formatDate(currentTime)} {currentTime.getFullYear()}
            </div>
          </div>
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
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Main weather grid - top row */}
      <div className="grid grid-cols-3 gap-2 h-48 mb-2">
        {/* Temperature */}
        <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
          <CardContent className="p-3 flex flex-col justify-center items-center h-full text-center">
            <Thermometer className="w-6 h-6 text-orange-400 mb-2" />
            <div className="text-3xl font-bold text-white mb-1">
              {tempC !== undefined ? tempC.toFixed(1) : '--'}
            </div>
            <div className="text-lg text-gray-300">°C</div>
            <div className="text-xs text-gray-500">Temperature</div>
          </CardContent>
        </Card>

        {/* Humidity */}
        <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
          <CardContent className="p-3 flex flex-col justify-center items-center h-full text-center">
            <Droplets className="w-6 h-6 text-blue-400 mb-2" />
            <div className="text-3xl font-bold text-white mb-1">
              {weatherData?.humidity ? weatherData.humidity.toFixed(0) : '--'}
            </div>
            <div className="text-lg text-gray-300">%</div>
            <div className="text-xs text-gray-500">Humidity</div>
          </CardContent>
        </Card>

        {/* Wind Speed */}
        <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
          <CardContent className="p-3 flex flex-col justify-center items-center h-full text-center">
            <Wind className="w-6 h-6 text-gray-400 mb-2" />
            <div className="text-3xl font-bold text-white mb-1">
              {windKmh ? windKmh.toFixed(1) : '--'}
            </div>
            <div className="text-lg text-gray-300">km/h</div>
            <div className="text-xs text-gray-500">Wind Speed</div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-2 h-48">
        {/* Pressure */}
        <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
          <CardContent className="p-3 flex flex-col justify-center items-center h-full text-center">
            <Eye className="w-6 h-6 text-purple-400 mb-2" />
            <div className="text-3xl font-bold text-white mb-1">
              {weatherData?.pressure ? weatherData.pressure.toFixed(0) : '--'}
            </div>
            <div className="text-lg text-gray-300">mb</div>
            <div className="text-xs text-gray-500">Pressure</div>
          </CardContent>
        </Card>

        {/* UV Index */}
        <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
          <CardContent className="p-3 flex flex-col justify-center items-center h-full text-center">
            <Zap className="w-6 h-6 text-yellow-400 mb-2" />
            <div className="text-3xl font-bold text-white mb-1">
              {weatherData?.uvIndex ? weatherData.uvIndex.toFixed(1) : '--'}
            </div>
            <div className="text-lg text-gray-300">Index</div>
            <div className="text-xs text-gray-500">
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
                : 'UV Index'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="flex justify-center items-center text-xs text-gray-600 mt-2">
        {lastUpdate
          ? `Updated: ${new Date(lastUpdate).toLocaleTimeString()}`
          : 'Waiting for data...'}
        {weatherData?.timestamp && (
          <span className="ml-4">
            Data: {new Date(weatherData.timestamp * 1000).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
