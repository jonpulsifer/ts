import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/16/solid';
import {
  Divider,
  Heading,
  Input,
  InputGroup,
  Link,
  Select,
  Strong,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@repo/ui';
import { TableActions } from 'components/table-actions';
import { getSortedVisibleGiftsForUser } from 'lib/prisma-ssr';
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
      <ChevronDownIcon height={16} />
    ) : (
      <ChevronUpIcon height={16} />
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
        <TableActions gift={gift} currentUserId={user.id} />
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
      <div className="grid grid-cols-2 gap-2 my-4">
        <InputGroup className="">
          <MagnifyingGlassIcon />
          <Input
            name="search"
            placeholder="Search&hellip;"
            aria-label="Search"
          />
        </InputGroup>
        <Select name="status">
          <option value="active">Sort by name</option>
          <option value="paused">Sort by owner</option>
        </Select>
      </div>
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
            <TableHeader className="text-right"></TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>{giftRows}</TableBody>
      </Table>
    </>
  );
}
