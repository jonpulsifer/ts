'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { setSetting } from '@/lib/actions';

interface SettingsFormProps {
  settings: Record<string, string>;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const serverOrigin = formData.get('serverOrigin') as string;
    const autoRegisterHosts = formData.get('autoRegisterHosts') === 'on';

    try {
      await setSetting('serverOrigin', serverOrigin);
      await setSetting('autoRegisterHosts', autoRegisterHosts.toString());
      setMessage('Settings saved successfully');
      router.refresh();
    } catch (err) {
      setMessage('Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Server Configuration</CardTitle>
          <CardDescription>
            Configure how Spore serves boot scripts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="serverOrigin">Server Origin</Label>
            <Input
              id="serverOrigin"
              name="serverOrigin"
              placeholder="http://10.2.0.11:3000"
              defaultValue={settings.serverOrigin || ''}
            />
            <p className="text-xs text-muted-foreground">
              The base URL used in template variables ({'{{base_url}}'},{' '}
              {'{{server_ip}}'}). If not set, Spore will use the request host.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="autoRegisterHosts">Auto-register Hosts</Label>
              <p className="text-sm text-muted-foreground">
                Automatically register unknown hosts when they boot
              </p>
            </div>
            <Switch
              id="autoRegisterHosts"
              name="autoRegisterHosts"
              defaultChecked={settings.autoRegisterHosts !== 'false'}
            />
          </div>

          {message && (
            <p
              className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-destructive'}`}
            >
              {message}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
