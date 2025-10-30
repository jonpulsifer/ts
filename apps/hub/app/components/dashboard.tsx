import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Clock,
  CloudRain,
  Compass,
  Droplets,
  Eye,
  RefreshCw,
  RotateCcw,
  Sun,
  Thermometer,
  Wifi,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useWeatherSocket } from '~/hooks/use-weather-socket';

interface ErrorModalProps {
  error: string;
  onClose: () => void;
}

function ErrorModal({ error, onClose }: ErrorModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border-2 border-red-500 rounded-lg p-6 max-w-lg w-full shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <h2 className="text-xl font-bold text-white">Configuration Error</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-gray-300 mb-4 whitespace-pre-line">{error}</div>
        <div className="bg-gray-900 rounded p-3 mb-4">
          <div className="text-sm font-mono text-gray-400 mb-2">
            Required environment variables:
          </div>
          <div className="space-y-1 text-xs font-mono text-gray-300">
            <div>TEMPESTWX_TOKENS (Secret, required)</div>
            <div className="text-xs text-gray-500 mt-1">Comma-separated list of tokens</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

interface RefreshMenuProps {
  onReconnect: () => void;
  onBrowserRefresh: () => void;
  isRefreshing: boolean;
}

function RefreshMenu({
  onReconnect,
  onBrowserRefresh,
  isRefreshing,
}: RefreshMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isRefreshing}
        className="p-1 hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Refresh options"
      >
        <RefreshCw
          className={`w-4 h-4 text-gray-400 ${
            isRefreshing ? 'animate-spin' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 min-w-[180px]">
          <button
            onClick={() => {
              onBrowserRefresh();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors first:rounded-t-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Browser Refresh</span>
          </button>
          <button
            onClick={() => {
              onReconnect();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors last:rounded-b-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reconnect WebSocket</span>
          </button>
        </div>
      )}
    </div>
  );
}

interface StationDisplayProps {
  stationLabel: string;
  weatherData: any;
  connectionStatus: string;
  lastUpdate: number | null;
  isSingleStation?: boolean;
}

function StationDisplay({
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
  const isDark = (weatherData?.illuminance !== undefined && weatherData.illuminance < 1000) ||
                 (weatherData?.uvIndex === undefined || weatherData.uvIndex === null || weatherData.uvIndex === 0);

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
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
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
          {weatherData?.minMax24h && (weatherData.minMax24h.tempMin !== undefined || weatherData.minMax24h.tempMax !== undefined) && (
            <div className="text-xs text-gray-500">
              {weatherData.minMax24h.tempMin !== undefined && weatherData.minMax24h.tempMax !== undefined
                ? `${weatherData.minMax24h.tempMin.toFixed(1)}° / ${weatherData.minMax24h.tempMax.toFixed(1)}°`
                : weatherData.minMax24h.tempMax !== undefined
                  ? `Max: ${weatherData.minMax24h.tempMax.toFixed(1)}°`
                  : `Min: ${weatherData.minMax24h.tempMin?.toFixed(1)}°`}
            </div>
          )}
        </div>

        {/* Weather Details Grid - 2x2 when single station, single column when multiple */}
        <div className={`flex-1 overflow-hidden min-h-0 ${isSingleStation ? 'grid grid-cols-2' : 'flex flex-col'}`}>
          {/* Humidity */}
          <div className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}>
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Humidity</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-lg font-bold text-white">
                {weatherData?.humidity
                  ? weatherData.humidity.toFixed(0)
                  : '--'}
                %
              </div>
              {weatherData?.minMax24h && (weatherData.minMax24h.humidityMin !== undefined || weatherData.minMax24h.humidityMax !== undefined) && (
                <div className="text-xs text-gray-500">
                  {weatherData.minMax24h.humidityMin !== undefined && weatherData.minMax24h.humidityMax !== undefined
                    ? `${weatherData.minMax24h.humidityMin.toFixed(0)}-${weatherData.minMax24h.humidityMax.toFixed(0)}%`
                    : weatherData.minMax24h.humidityMax !== undefined
                      ? `Max: ${weatherData.minMax24h.humidityMax.toFixed(0)}%`
                      : `Min: ${weatherData.minMax24h.humidityMin?.toFixed(0)}%`}
                </div>
              )}
            </div>
          </div>

          {/* Wind - Avg */}
          <div className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}>
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
              {weatherData?.minMax24h && weatherData.minMax24h.windSpeedMax !== undefined && (
                <div className="text-xs text-gray-500">
                  Max: {(weatherData.minMax24h.windSpeedMax * 3.6).toFixed(1)} km/h
                </div>
              )}
            </div>
          </div>

          {/* Pressure */}
          <div className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Pressure</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">
                  {weatherData?.pressure
                    ? weatherData.pressure.toFixed(0)
                    : '--'}
                </span>
                <span className="text-xs text-gray-500">mb</span>
                {getBarometricTrendIcon(barometricTrend)}
              </div>
              {weatherData?.minMax24h && (weatherData.minMax24h.pressureMin !== undefined || weatherData.minMax24h.pressureMax !== undefined) && (
                <div className="text-xs text-gray-500">
                  {weatherData.minMax24h.pressureMin !== undefined && weatherData.minMax24h.pressureMax !== undefined
                    ? `${weatherData.minMax24h.pressureMin.toFixed(0)}-${weatherData.minMax24h.pressureMax.toFixed(0)} mb`
                    : weatherData.minMax24h.pressureMax !== undefined
                      ? `Max: ${weatherData.minMax24h.pressureMax.toFixed(0)} mb`
                      : `Min: ${weatherData.minMax24h.pressureMin?.toFixed(0)} mb`}
                </div>
              )}
            </div>
          </div>

          {/* UV Index */}
          <div className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-400">UV</span>
            </div>
            <div className="flex flex-col items-end">
              <div className={`font-bold text-white ${
                !isDark
                  ? 'text-lg'
                  : 'text-sm'
              }`}>
                {isDark
                  ? 'IT\'S NIGHT TIME'
                  : weatherData?.uvIndex !== undefined && weatherData.uvIndex !== null
                    ? weatherData.uvIndex.toFixed(1)
                    : 'IT\'S NIGHT TIME'}
              </div>
              {weatherData?.minMax24h && weatherData.minMax24h.uvIndexMax !== undefined && (
                <div className="text-xs text-gray-500">
                  Max: {weatherData.minMax24h.uvIndexMax.toFixed(1)}
                </div>
              )}
            </div>
          </div>

          {/* Wind - Lull */}
          {windLullKmh !== undefined && (
            <div className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}>
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
            <div className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}>
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
            <div className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}>
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
          {weatherData?.solarRadiation !== undefined && weatherData.solarRadiation !== null && (
            <div className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}>
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
          {weatherData?.illuminance !== undefined && weatherData.illuminance !== null && (
            <div className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}>
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
          <div className={`flex items-center justify-between px-2 py-0.5 border-b border-gray-800 ${isSingleStation ? 'border-r border-r-gray-800' : ''} flex-shrink-0`}>
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Rain</span>
            </div>
            <div className="flex flex-col items-end">
              {weatherData?.rainTotal !== undefined && weatherData.rainTotal !== null ? (
                <>
                  <div className="text-lg font-bold text-white">
                    {weatherData.rainTotal.toFixed(1)} mm
                  </div>
                  {weatherData?.rainDuration !== undefined && weatherData.rainDuration !== null && weatherData.rainDuration > 0 && (
                    <div className="text-xs text-gray-500">
                      {Math.floor(weatherData.rainDuration / 60)}h {weatherData.rainDuration % 60}m
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

export default function Dashboard() {
  const { stations, connectionError, connect } = useWeatherSocket();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showError, setShowError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update current time every second
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Show error modal when there's a connection error, but debounce to prevent flashing
  useEffect(() => {
    if (connectionError) {
      // Only show modal for configuration errors, not transient connection errors
      const isConfigError =
        connectionError.includes('environment variables') ||
        connectionError.includes('not configured') ||
        connectionError.includes('Missing') ||
        connectionError.includes('No weather stations configured');
      
      if (isConfigError) {
        // Small delay to prevent flashing if error clears quickly
        const timeout = setTimeout(() => {
          setShowError(true);
        }, 500);
        
        return () => clearTimeout(timeout);
      } else {
        // For transient errors, just show the error badge, not the modal
        setShowError(false);
      }
    } else {
      // Clear modal when error is cleared
      setShowError(false);
    }
  }, [connectionError]);

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
  const stationArray = Array.from(stations.entries()).map(([deviceId, data]) => ({
    deviceId,
    ...data,
  }));

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900">
      {/* Error Modal */}
      {showError && connectionError && (
        <ErrorModal
          error={connectionError}
          onClose={() => setShowError(false)}
        />
      )}

      {/* Header - Minimal padding */}
      <div className="flex justify-between items-center px-2 py-1 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-baseline gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <div className="text-xl font-mono font-bold text-white">
            {currentTime ? formatTime(currentTime) : '--:--:--'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Error indicator - clickable to reopen modal */}
          {connectionError && !showError && (
            <button
              onClick={() => setShowError(true)}
              className="flex items-center gap-1 px-2 py-1 bg-red-900/50 hover:bg-red-900/70 rounded transition-colors"
              title="Click to view error details"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400 font-semibold">Error</span>
            </button>
          )}

          {/* Refresh menu */}
          <RefreshMenu
            onReconnect={handleReconnect}
            onBrowserRefresh={handleBrowserRefresh}
            isRefreshing={isRefreshing}
          />

          <div className="text-sm font-mono font-bold text-white">
            {currentTime
              ? `${formatDate(currentTime)} ${currentTime.getFullYear()}`
              : '---, --- --'}
          </div>
        </div>
      </div>

      {/* Split Screen - Stations evenly distributed */}
      <div className="flex-1 flex overflow-hidden w-full">
        {stationArray.length > 0 ? (
          stationArray.map((station, index) => (
            <StationDisplay
              key={station.deviceId}
              stationLabel={station.weatherData.stationLabel || `Device ${station.deviceId}`}
              weatherData={station.weatherData}
              connectionStatus={station.connectionStatus}
              lastUpdate={station.lastUpdate}
              isSingleStation={stationArray.length === 1}
            />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
            <AlertCircle className="w-16 h-16 text-red-400" />
            <div className="text-center">
              <div className="text-2xl font-semibold">No stations configured</div>
              <div className="text-base text-gray-600 mt-2">
                {connectionError ? (
                  'Check error message above'
                ) : (
                  'Waiting for weather stations...'
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
