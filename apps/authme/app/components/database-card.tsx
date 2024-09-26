'use client';
import { Card } from '@repo/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/table';

interface CardProps {
  version: string;
  connections: string;
  maxConnections: string;
}

export function DatabaseCard({
  version,
  connections,
  maxConnections,
}: CardProps) {
  return (
    <Card subtitle={version} title="Database">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Current</TableHeader>
            <TableHeader>Max</TableHeader>
            <TableHeader>Version</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{connections}</TableCell>
            <TableCell>{maxConnections}</TableCell>
            <TableCell>{version}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
