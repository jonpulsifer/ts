'use client';

import { Home, Settings, Wifi } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '~/components/ui/button';
import { useWeatherSocket } from '~/hooks/use-weather-socket';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { connectionStatus } = useWeatherSocket();

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            variant={location.pathname === '/' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/')}
            className="h-8"
          >
            <Home className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
          <Button
            variant={location.pathname === '/settings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/settings')}
            className="h-8"
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs">
            <Wifi
              className={`w-3 h-3 ${connectionStatus === 'connected' ? 'text-green-500' : 'text-red-500'}`}
            />
            <span className="text-slate-600 capitalize">
              {connectionStatus}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </nav>
  );
}
