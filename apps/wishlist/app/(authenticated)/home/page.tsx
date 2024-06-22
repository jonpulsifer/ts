import {
  Divider,
  Heading,
  Strong,
  Subheading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@repo/ui';
import { auth } from 'app/auth';
import { ClaimButton } from 'components/claim-button';
import { DeleteButton } from 'components/delete-button';
import { EditButton } from 'components/edit-button';
import { getLatestVisibleGiftsForUserById } from 'lib/prisma-ssr';
import { timeAgo } from 'lib/utils';

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const { gifts } = await getLatestVisibleGiftsForUserById(session.user.id);
  const giftRows = gifts.map((gift) => {
    const createdAtHumanReadable = timeAgo(gift.createdAt);
    return (
      <TableRow>
        <TableCell>
          <div className="flex flex-col">
            <Text>
              <Strong>{gift.name}</Strong>
            </Text>
            <span className="text-xs text-zinc-400">
              <span className="font-semibold">
                {gift.owner.name || gift.owner.email}
              </span>{' '}
              created {createdAtHumanReadable}
            </span>
          </div>
        </TableCell>
        <TableCell className="">
          <div className="text-right space-x-4">
            <ClaimButton gift={gift} currentUserId={session.user.id} />
            <EditButton gift={gift} currentUserId={session.user.id} />
            <DeleteButton gift={gift} currentUserId={session.user.id} />
          </div>
        </TableCell>
      </TableRow>
    );
  });
  return (
    <div className="space-y-4 sm:gap-y-2">
      <div>
        <Heading>Welcome to wishin.app</Heading>
        <Subheading>A wishlist app for friends and family</Subheading>
      </div>
      <Divider className="my-4" soft />
      <div>
        <Subheading>Latest Gifts</Subheading>
        <Text>Below are the latest 10 gifts that you can see!</Text>
        <Table dense>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>{giftRows}</TableBody>
        </Table>
      </div>
    </div>
  );
}
