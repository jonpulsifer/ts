import { Avatar } from '@repo/ui/avatar';
import { Badge } from '@repo/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/table';
import { UserWithGifts } from 'types/prisma';

export function UserTable({ users }: { users: UserWithGifts[] }) {
  return (
    <Table className="[--gutter:theme(spacing.6)] sm:[--gutter:theme(spacing.8)]">
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Joined</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.name || ''} href={`/user/${user.id}`}>
            <TableCell>
              <div className="flex items-center gap-4">
                <Avatar src={user.image} className="size-12" />
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-zinc-500">
                    <a href="#" className="hover:text-zinc-700">
                      {user.email}
                    </a>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-zinc-500">
              {user.createdAt.toDateString()}
            </TableCell>
            <TableCell>
              <Badge color="zinc">Offline</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
