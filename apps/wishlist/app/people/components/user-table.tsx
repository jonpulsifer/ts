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
  const tableRows = users.map((user) => {
    const initials = user.name ? user.name[0].toUpperCase() : '';
    return (
      <TableRow key={user.name || ''} href={`/user/${user.id}`}>
        <TableCell>
          <div className="flex items-center gap-4">
            <Avatar
              src={user.image}
              initials={!user.image ? initials : undefined}
              className="size-10 sm:size-12"
            />
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-slate-500">
                <a href="#" className="hover:text-slate-700">
                  {user.email}
                </a>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge color="slate">Offline</Badge>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <Table
      bleed
      className="[--gutter:theme(spacing.6)] sm:[--gutter:theme(spacing.8)]"
    >
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>{tableRows}</TableBody>
    </Table>
  );
}
