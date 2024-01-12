'use client';
import { Card } from 'ui';

interface Props {
  version: string;
  connections: number;
  maxConnections: number;
}

export const DatabaseCard = ({
  version,
  connections,
  maxConnections,
}: Props) => {
  return (
    <Card title="CloudSQL" subtitle={`${version}`}>
      <div className="p-4">
        <p className="font-bold">This is the database.</p>
        <p className="text-sm text-gray-500">Connections</p>
        <pre className="text-xs">{connections}</pre>
        <p className="text-sm text-gray-500">Max Connections</p>
        <pre className="text-xs">{maxConnections}</pre>
      </div>
    </Card>
  );
};
