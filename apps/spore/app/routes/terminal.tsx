import { Terminal } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { WebTerminal } from '~/components/web-terminal';
import type { Route } from './+types/terminal';

export const meta: Route.MetaFunction = () => [{ title: 'Terminal - Spore' }];

export default function TerminalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Server Terminal</h1>
        <p className="text-muted-foreground">
          Access the server shell directly from the browser.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <CardTitle>Web Terminal</CardTitle>
          </div>
          <CardDescription>
            Click Connect to start a terminal session. Use this to manage
            services, view logs, or run commands on the server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebTerminal className="w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
