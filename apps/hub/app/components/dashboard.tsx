import { AlertCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWeatherSocket } from '~/hooks/use-weather-socket';
import { RefreshMenu } from './RefreshMenu';
import { StationDisplay } from './StationDisplay';

export default function Dashboard() {
  const { stations, connectionError, sseStatus, connect } = useWeatherSocket();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update current time every second
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBrowserRefresh = () => {
    window.location.reload();
  };

  const handleReconnect = () => {
    setIsRefreshing(true);
    connect();
    // Reset refreshing state after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

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

  // Convert stations Map to array for display
  const stationArray = Array.from(stations.entries()).map(
    ([deviceId, data]) => ({
      deviceId,
      ...data,
    }),
  );

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900">
      {/* Header - Minimal padding */}
      <div className="flex justify-between items-center px-2 py-1 border-b border-gray-700 flex-shrink-0 relative">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <div className="text-xs font-medium text-gray-400">
            {currentTime
              ? `${formatDate(currentTime)} ${currentTime.getFullYear()}`
              : '---, --- --'}
          </div>
        </div>
        <div
          className="absolute -translate-x-1/2"
          style={{
            // With flex-1, flex-0.5, flex-1 layout:
            // Left: 1/(1+0.5+1) = 40%, Diff: 0.5/2.5 = 20%, Right: 40%
            // Diff center: 40% + 20%/2 = 50%
            left:
              stationArray.length === 2
                ? '50%' // Center of difference column (which is at 50% with the flex layout)
                : '50%', // True center when no difference column
          }}
        >
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tabular-nums tracking-wider">
            {currentTime ? formatTime(currentTime) : '--:--:--'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Error indicator */}
          {connectionError && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-900/50 rounded">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400 font-semibold">Error</span>
            </div>
          )}

          {/* Refresh menu */}
          <RefreshMenu
            onReconnect={handleReconnect}
            onBrowserRefresh={handleBrowserRefresh}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>

      {/* Three Column Layout: Left Station | Comparison | Right Station */}
      <div className="flex-1 flex overflow-hidden w-full">
        {stationArray.length > 0 ? (
          <>
            {/* Left Station */}
            {stationArray[0] && (
              <StationDisplay
                key={stationArray[0].deviceId}
                stationLabel={
                  stationArray[0].weatherData.stationLabel ||
                  `Device ${stationArray[0].deviceId}`
                }
                weatherData={stationArray[0].weatherData}
                connectionStatus={stationArray[0].connectionStatus}
                lastUpdate={stationArray[0].lastUpdate}
                isSingleStation={false}
                websocketStatus={stationArray[0].websocketStatus}
                sseStatus={sseStatus}
              />
            )}

            {/* Comparison Station - Only show if we have 2 stations */}
            {stationArray.length === 2 &&
              (() => {
                const left = stationArray[0].weatherData;
                const right = stationArray[1].weatherData;

                // Calculate differences (left - right)
                const diffData = {
                  temperature:
                    left.temperature != null && right.temperature != null
                      ? left.temperature - right.temperature
                      : undefined,
                  humidity:
                    left.humidity != null && right.humidity != null
                      ? left.humidity - right.humidity
                      : undefined,
                  windSpeed:
                    left.windSpeed != null && right.windSpeed != null
                      ? left.windSpeed - right.windSpeed // Keep in m/s, StationDisplay will convert
                      : undefined,
                  windLull:
                    left.windLull != null && right.windLull != null
                      ? left.windLull - right.windLull // Keep in m/s, StationDisplay will convert
                      : undefined,
                  windGust:
                    left.windGust != null && right.windGust != null
                      ? left.windGust - right.windGust // Keep in m/s, StationDisplay will convert
                      : undefined,
                  pressure:
                    left.pressure != null && right.pressure != null
                      ? left.pressure - right.pressure
                      : undefined,
                  uvIndex:
                    left.uvIndex != null && right.uvIndex != null
                      ? left.uvIndex - right.uvIndex
                      : undefined,
                  solarRadiation:
                    left.solarRadiation != null && right.solarRadiation != null
                      ? left.solarRadiation - right.solarRadiation
                      : undefined,
                  illuminance:
                    left.illuminance != null && right.illuminance != null
                      ? left.illuminance - right.illuminance
                      : undefined,
                  rainTotal:
                    left.rainTotal != null && right.rainTotal != null
                      ? left.rainTotal - right.rainTotal
                      : undefined,
                  minMax24h: {
                    tempMin:
                      left.minMax24h?.tempMin != null &&
                      right.minMax24h?.tempMin != null
                        ? left.minMax24h.tempMin - right.minMax24h.tempMin
                        : undefined,
                    tempMax:
                      left.minMax24h?.tempMax != null &&
                      right.minMax24h?.tempMax != null
                        ? left.minMax24h.tempMax - right.minMax24h.tempMax
                        : undefined,
                    humidityMin:
                      left.minMax24h?.humidityMin != null &&
                      right.minMax24h?.humidityMin != null
                        ? left.minMax24h.humidityMin -
                          right.minMax24h.humidityMin
                        : undefined,
                    humidityMax:
                      left.minMax24h?.humidityMax != null &&
                      right.minMax24h?.humidityMax != null
                        ? left.minMax24h.humidityMax -
                          right.minMax24h.humidityMax
                        : undefined,
                    windSpeedMax:
                      left.minMax24h?.windSpeedMax != null &&
                      right.minMax24h?.windSpeedMax != null
                        ? left.minMax24h.windSpeedMax -
                          right.minMax24h.windSpeedMax // Keep in m/s, StationDisplay will convert
                        : undefined,
                    pressureMin:
                      left.minMax24h?.pressureMin != null &&
                      right.minMax24h?.pressureMin != null
                        ? left.minMax24h.pressureMin -
                          right.minMax24h.pressureMin
                        : undefined,
                    pressureMax:
                      left.minMax24h?.pressureMax != null &&
                      right.minMax24h?.pressureMax != null
                        ? left.minMax24h.pressureMax -
                          right.minMax24h.pressureMax
                        : undefined,
                    uvIndexMax:
                      left.minMax24h?.uvIndexMax != null &&
                      right.minMax24h?.uvIndexMax != null
                        ? left.minMax24h.uvIndexMax - right.minMax24h.uvIndexMax
                        : undefined,
                  },
                };

                return (
                  <StationDisplay
                    key="diff"
                    stationLabel="Difference"
                    weatherData={diffData}
                    connectionStatus="connected"
                    lastUpdate={Math.max(
                      stationArray[0].lastUpdate || 0,
                      stationArray[1].lastUpdate || 0,
                    )}
                    isSingleStation={false}
                    isDiff={true}
                  />
                );
              })()}

            {/* Right Station */}
            {stationArray[1] && (
              <StationDisplay
                key={stationArray[1].deviceId}
                stationLabel={
                  stationArray[1].weatherData.stationLabel ||
                  `Device ${stationArray[1].deviceId}`
                }
                weatherData={stationArray[1].weatherData}
                connectionStatus={stationArray[1].connectionStatus}
                lastUpdate={stationArray[1].lastUpdate}
                isSingleStation={false}
                websocketStatus={stationArray[1].websocketStatus}
                sseStatus={sseStatus}
              />
            )}

            {/* Additional stations if more than 2 */}
            {stationArray.slice(2).map((station) => (
              <StationDisplay
                key={station.deviceId}
                stationLabel={
                  station.weatherData.stationLabel ||
                  `Device ${station.deviceId}`
                }
                weatherData={station.weatherData}
                connectionStatus={station.connectionStatus}
                lastUpdate={station.lastUpdate}
                isSingleStation={false}
                websocketStatus={station.websocketStatus}
                sseStatus={sseStatus}
              />
            ))}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
            {connectionError ? (
              <>
                <AlertCircle className="w-16 h-16 text-red-400" />
                <div className="text-center">
                  <div className="text-2xl font-semibold text-red-400">
                    Connection Error
                  </div>
                  <div className="text-base text-gray-400 mt-2">
                    {connectionError}
                  </div>
                </div>
              </>
            ) : sseStatus === 'connecting' ? (
              <>
                <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                <div className="text-center">
                  <div className="text-2xl font-semibold text-blue-400">
                    Connecting...
                  </div>
                  <div className="text-base text-gray-500 mt-2">
                    Establishing connection to weather server
                  </div>
                </div>
              </>
            ) : sseStatus === 'connected' ? (
              <>
                <div className="w-16 h-16 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                <div className="text-center">
                  <div className="text-2xl font-semibold text-green-400">
                    Waiting for Data
                  </div>
                  <div className="text-base text-gray-500 mt-2">
                    Connected. Waiting for first weather observation...
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 text-gray-600" />
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-500">
                    No Stations Available
                  </div>
                  <div className="text-base text-gray-600 mt-2">
                    Waiting for weather stations to report in...
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
