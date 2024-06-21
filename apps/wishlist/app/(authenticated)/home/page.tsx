import {
  Divider,
  Heading,
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

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const { gifts } = await getLatestVisibleGiftsForUserById(session.user.id);
  const giftRows = gifts.map((gift) => (
    <TableRow>
      <TableCell>
        <div className="flex flex-col">
          {gift.name}
          <span className="text-xs text-zinc-400">
            Created on {gift.createdAt.toLocaleDateString()}
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
  ));
  return (
    <>
      <Heading>Welcome to wishin.app</Heading>
      <Subheading>A wishlist app for friends and family</Subheading>
      <Divider className="my-4" soft />
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
    </>
  );
}
