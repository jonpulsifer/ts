import {
  Button,
  Divider,
  Heading,
  Link,
  Strong,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@repo/ui';
import { getSortedVisibleGiftsForUser } from 'lib/prisma-ssr';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from 'lucide-react';
import React from 'react';
import { UrlObject } from 'url';

export default async function Gifts({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { orderBy = 'asc' } = searchParams;
  const direction = Array.isArray(orderBy) ? orderBy[0] : orderBy;

  const sortIcon =
    direction === 'asc' ? (
      <ChevronDownIcon size={16} />
    ) : (
      <ChevronUpIcon size={16} />
    );

  // Button with an href to add the query parameter to the URL
  // for sorting the gifts in the opposite direction
  const href: UrlObject = {
    pathname: '/gifts',
    query: { orderBy: direction === 'asc' ? 'desc' : 'asc' },
  };
  const sortButton = (
    <Link href={href as unknown as string}>
      <Button plain>{sortIcon}</Button>
    </Link>
  );

  const { gifts } = await getSortedVisibleGiftsForUser(direction);

  const giftRows = gifts.map((gift) => (
    <TableRow key={gift.id} href={`/gift/${gift.id}`}>
      <TableCell>{gift.name}</TableCell>
      <TableCell>{gift.owner.name}</TableCell>
      <TableCell>
        <Button>Claim</Button>
      </TableCell>
    </TableRow>
  ));
  return (
    <>
      <div className="flex justify-between">
        <Heading>Gifts</Heading>
        <div className="flex gap-4">
          <Button>
            <PlusIcon size={16} />
            Add Gift
          </Button>
        </div>
      </div>
      <Divider className="my-4" soft />
      <Text>
        Below are all of the <Strong>claimable</Strong> gifts that people have
        added to their wishlists.
      </Text>
      <Divider className="my-4" soft />
      <Table dense>
        <TableHead>
          <TableRow>
            <TableHeader className="flex items-center gap-2">
              Gift
              {sortButton}
            </TableHeader>
            <TableHeader>Owner</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>{giftRows}</TableBody>
      </Table>
    </>
  );
}
