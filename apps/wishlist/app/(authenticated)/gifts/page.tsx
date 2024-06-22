import {
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
import { ClaimButton } from 'components/claim-button';
import { DeleteButton } from 'components/delete-button';
import { EditButton } from 'components/edit-button';
import { getSortedVisibleGiftsForUser } from 'lib/prisma-ssr';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import React from 'react';
import { UrlObject } from 'url';

export default async function Gifts({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const {
    direction: directionFromParams = 'asc',
    column: columnFromParams = 'name',
  } = searchParams;

  const firstDirectionFromParams = Array.isArray(directionFromParams)
    ? directionFromParams[0]
    : directionFromParams;
  const direction = firstDirectionFromParams === 'asc' ? 'asc' : 'desc';

  const firstColumnFromParams = Array.isArray(columnFromParams)
    ? columnFromParams[0]
    : columnFromParams;
  const column = firstColumnFromParams === 'owner' ? 'owner' : 'name';

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
    query: { column: 'name', direction: direction === 'asc' ? 'desc' : 'asc' },
  };

  // Button with an href to add the query parameter to the URL
  // for sorting the gifts by owner
  const hrefOwner: UrlObject = {
    pathname: '/gifts',
    query: { column: 'owner', direction: direction === 'asc' ? 'desc' : 'asc' },
  };

  const { gifts, user } = await getSortedVisibleGiftsForUser({
    direction,
    column,
  });

  const giftRows = gifts.map((gift) => (
    <TableRow key={gift.id} href={`/gift/${gift.id}`}>
      <TableCell>
        <Text>{gift.name}</Text>
      </TableCell>
      <TableCell>
        <Text>{gift.owner.name || gift.owner.email}</Text>
      </TableCell>
      <TableCell className="justify-end text-right space-x-1 sm:space-x-2">
        <ClaimButton gift={gift} currentUserId={user.id} />
        <EditButton gift={gift} currentUserId={user.id} />
        <DeleteButton gift={gift} currentUserId={user.id} />
      </TableCell>
    </TableRow>
  ));
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading>Gifts</Heading>
        <div className="flex gap-4"></div>
      </div>
      <Divider className="my-4" soft />
      <Text>
        The gifts in the list are
        <Strong> claimable gifts</Strong>,
        <Strong> gifts that you have created</Strong>, or
        <Strong> gifts that you have already claimed</Strong>. Any gifts that
        you have created or claimed will not have the option to claim them.
      </Text>
      <Table striped dense>
        <TableHead>
          <TableRow>
            <TableHeader>
              <Link
                className="flex items-center gap-2"
                href={href as unknown as string}
              >
                Name {sortIcon}
              </Link>
            </TableHeader>
            <TableHeader>
              <Link
                className="flex items-center gap-2"
                href={hrefOwner as unknown as string}
              >
                Recipient {sortIcon}
              </Link>
            </TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>{giftRows}</TableBody>
      </Table>
    </>
  );
}
