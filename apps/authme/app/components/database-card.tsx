'use client';
import { Card } from '@repo/ui/card';

interface CardProps {
  version: string;
  connections: string;
  maxConnections: string;
}

export function DatabaseCard({
  version,
  connections,
  maxConnections,
}: CardProps): JSX.Element {
  return (
    <Card subtitle={version} title="CloudSQL">
      <div className="pb-4 px-4">
        <p className="font-bold">This is the database.</p>
        <p className="text-sm text-gray-500">Connections</p>
        <pre className="text-xs">{connections}</pre>
        <p className="text-sm text-gray-500">Max Connections</p>
        <pre className="text-xs">{maxConnections}</pre>
      </div>
    </Card>
  );
}
