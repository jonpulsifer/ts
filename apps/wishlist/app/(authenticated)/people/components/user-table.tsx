import { Avatar } from '@repo/ui';
import { Badge } from '@repo/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/table';
import { Strong, Text } from '@repo/ui/text';
import type { UserWithGifts } from 'types/prisma';

export function UserTable({ users }: { users: UserWithGifts[] }) {
  const tableRows = users.map((user) => {
    const displayName = user.name || user.email || '?';
    const initials = displayName.charAt(0).toUpperCase();
    return (
      <TableRow key={user.id} href={`/user/${user.id}`}>
        <TableCell>
          <div className="flex items-center gap-4">
            <Avatar
              square
              src={user.image}
              initials={!user.image ? initials : undefined}
              className="size-10 sm:size-12 bg-zinc-200 dark:bg-zinc-950 dark:text-indigo-500"
            />
            <div>
              <Text>
                <Strong>{displayName}</Strong>
              </Text>
              {/* <div className="text-zinc-500">
                <a href="#" className="hover:text-zinc-700">
                  {user.email}
                </a>
              </div> */}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge color="zinc">Offline</Badge>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <Table
      bleed
      dense
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
