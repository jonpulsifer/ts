'use client';
import { Card } from '@repo/ui/card';
import { Strong, Text } from '@repo/ui/text';

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
      <Text>
        <Strong>This is the database.</Strong>
      </Text>
      <Text>Connections</Text>
      <Text className="text-xs">{connections}</Text>
      <Text>Max Connections</Text>
      <Text className="text-xs">{maxConnections}</Text>
    </Card>
  );
}
