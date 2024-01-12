'use client';
import { Card } from 'ui';

interface Props {
  version: string;
  connections: string;
  maxConnections: string;
}

export const DatabaseCard = ({
  version,
  connections,
  maxConnections,
}: Props) => {
  return (
    <Card title="CloudSQL" subtitle={`${version}`}>
      <div className="pb-4 px-4">
        <p className="font-bold">This is the database.</p>
        <p className="text-sm text-gray-500">Connections</p>
        <pre className="text-xs">{connections}</pre>
        <p className="text-sm text-gray-500">Max Connections</p>
        <pre className="text-xs">{maxConnections}</pre>
      </div>
    </Card>
  );
};
