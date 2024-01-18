import { Badge } from '@repo/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/table';
import { GiftWithOwner } from 'types/prisma';

interface Props {
  gifts: GiftWithOwner[];
  currentUserId: string;
}

export function GiftTable({ gifts }: Props) {
  const tableRows = gifts.map((gift) => {
    return (
      <TableRow key={gift.id} href={`/gift/${gift.id}`}>
        <TableCell>
          <div className="flex items-center gap-4">
            <div className="font-medium">{gift.name}</div>
            {/* <div className="text-slate-500">
                <a href="#" className="hover:text-slate-700">
                  {user.email}
                </a>
              </div> */}
          </div>
        </TableCell>
        <TableCell>
          <Badge color="indigo">Claim</Badge>
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
          <TableHeader>Action</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>{tableRows}</TableBody>
    </Table>
  );
}
