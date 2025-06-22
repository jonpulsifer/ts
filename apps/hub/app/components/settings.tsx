'use client';

import { useId, useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useWeatherSocket } from '~/hooks/use-weather-socket';

export default function Settings() {
  const [token, setToken] = useState(import.meta.env.VITE_TEMPESTWX_TOKEN);
  const [deviceId, setDeviceId] = useState(
    import.meta.env.VITE_TEMPESTWX_DEVICE_ID,
  );
  const tokenId = useId();
  const deviceIdId = useId();
  const { connectionStatus, connect, disconnect } = useWeatherSocket();

  const handleConnect = () => {
    if (token && deviceId) {
      connect(token, Number.parseInt(deviceId));
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Tempest Weather Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Status:</span>
              <Badge
                variant={
                  connectionStatus === 'connected' ? 'default' : 'secondary'
                }
              >
                {connectionStatus}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Access Token</Label>
              <Input
                id={tokenId}
                type="password"
                placeholder="Enter your Tempest access token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceId">Device ID</Label>
              <Input
                id={deviceIdId}
                placeholder="Enter your device ID"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleConnect} disabled={!token || !deviceId}>
                Connect
              </Button>
              <Button variant="outline" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Display Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Screen Resolution:</span>
                <span>800x480</span>
              </div>
              <div className="flex justify-between">
                <span>Optimized for:</span>
                <span>Raspberry Pi Official Display</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
