import { AlertCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWeatherSocket } from '~/hooks/use-weather-socket';
import { ErrorModal } from './ErrorModal';
import { RefreshMenu } from './RefreshMenu';
import { StationDisplay } from './StationDisplay';

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
      }
      // For transient errors, just show the error badge, not the modal
      setShowError(false);
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
  const stationArray = Array.from(stations.entries()).map(
    ([deviceId, data]) => ({
      deviceId,
      ...data,
    }),
  );

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
              type="button"
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
          stationArray.map((station) => (
            <StationDisplay
              key={station.deviceId}
              stationLabel={
                station.weatherData.stationLabel || `Device ${station.deviceId}`
              }
              weatherData={station.weatherData}
              connectionStatus={station.connectionStatus}
              lastUpdate={station.lastUpdate}
              websocketStatus={station.websocketStatus}
              websocketError={station.websocketError}
              lastDataReceived={station.lastDataReceived}
              isSingleStation={stationArray.length === 1}
            />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
            <AlertCircle className="w-16 h-16 text-red-400" />
            <div className="text-center">
              <div className="text-2xl font-semibold">
                No stations configured
              </div>
              <div className="text-base text-gray-600 mt-2">
                {connectionError
                  ? 'Check error message above'
                  : 'Waiting for weather stations...'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
