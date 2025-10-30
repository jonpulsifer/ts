import { RefreshCw, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
        type="button"
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
