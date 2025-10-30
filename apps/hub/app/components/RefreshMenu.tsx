import { Power, RefreshCw, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface RefreshMenuProps {
  onReconnect: () => void;
  onBrowserRefresh: () => void;
  isRefreshing: boolean;
}

export function RefreshMenu({
  onReconnect,
  onBrowserRefresh,
  isRefreshing,
}: RefreshMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const HOLD_DURATION_MS = 3000;
  const holdStartRef = useRef<number | null>(null);
  const holdAnimationFrameRef = useRef<number | null>(null);
  const [exitHoldProgress, setExitHoldProgress] = useState(0);
  const [isExitPending, setIsExitPending] = useState(false);
  const [exitError, setExitError] = useState<string | null>(null);

  const cancelExitHold = useCallback(() => {
    if (holdAnimationFrameRef.current !== null) {
      cancelAnimationFrame(holdAnimationFrameRef.current);
      holdAnimationFrameRef.current = null;
    }
    holdStartRef.current = null;
    setExitHoldProgress(0);
  }, []);

  const triggerExit = async () => {
    if (isExitPending) {
      return;
    }

    setIsExitPending(true);
    try {
      const response = await fetch('/api/exit', { method: 'POST' });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP ${response.status}`);
      }

      setExitError(null);
      setExitHoldProgress(100);
      setIsOpen(false);
    } catch (error) {
      setIsExitPending(false);
      cancelExitHold();
      setExitError(
        error instanceof Error
          ? error.message
          : 'Failed to trigger restart. Try again.',
      );
    }
  };

  const startExitHold = () => {
    if (isExitPending) {
      return;
    }

    setExitError(null);
    holdStartRef.current = performance.now();
    setExitHoldProgress(0);

    const step = (timestamp: number) => {
      if (holdStartRef.current === null) {
        return;
      }

      const elapsed = timestamp - holdStartRef.current;
      const progress = Math.min(1, elapsed / HOLD_DURATION_MS);
      setExitHoldProgress(progress * 100);

      if (progress >= 1) {
        holdStartRef.current = null;
        holdAnimationFrameRef.current = null;
        void triggerExit();
      } else {
        holdAnimationFrameRef.current = requestAnimationFrame(step);
      }
    };

    holdAnimationFrameRef.current = requestAnimationFrame(step);
  };

  const handleExitPointerEnd = () => {
    if (holdStartRef.current !== null && !isExitPending) {
      cancelExitHold();
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        cancelExitHold();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, cancelExitHold]);

  useEffect(() => {
    if (!isOpen && !isExitPending) {
      cancelExitHold();
      setExitError(null);
    }
  }, [isOpen, isExitPending, cancelExitHold]);

  useEffect(() => {
    return () => {
      cancelExitHold();
    };
  }, [cancelExitHold]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isRefreshing || isExitPending}
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
        <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 min-w-[220px]">
          <button
            type="button"
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
            type="button"
            onClick={() => {
              onReconnect();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reconnect WebSocket</span>
          </button>
          <div className="border-t border-gray-700" />
          <button
            type="button"
            disabled={isExitPending}
            onPointerDown={startExitHold}
            onPointerUp={handleExitPointerEnd}
            onPointerLeave={handleExitPointerEnd}
            onPointerCancel={handleExitPointerEnd}
            className="relative overflow-hidden w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-red-300 hover:bg-red-900/30 transition-colors rounded-b-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div
              className="absolute inset-0 left-0 top-0 h-full bg-red-900/40 transition-[width] duration-100 ease-out"
              style={{ width: `${exitHoldProgress}%` }}
            />
            <div className="relative flex items-center gap-2">
              <Power className="w-4 h-4" />
              <span>
                {isExitPending ? 'Restarting…' : 'Restart Service (Hold 3s)'}
              </span>
            </div>
          </button>
          {exitError && (
            <div className="px-3 pb-2 text-xs text-red-400">{exitError}</div>
          )}
        </div>
      )}
    </div>
  );
}
