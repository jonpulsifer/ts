'use client';

import {
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/react/16/solid';
import type { Prisma, User, Wishlist } from '@prisma/client';
import {
  Button,
  Divider,
  Field,
  Heading,
  Input,
  Strong,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@repo/ui';
import { joinWishlist, leaveWishlist } from 'app/actions';
import { toast } from 'react-hot-toast';

import EmptyState from 'components/EmptyState';

type WishlistsWithoutPasswords = Prisma.WishlistGetPayload<{
  select: {
    id: true;
    name: true;
    members: {
      select: {
        id: true;
      };
    };
    _count: {
      select: {
        members: true;
        gifts: true;
      };
    };
  };
}>;

interface Props {
  wishlists: WishlistsWithoutPasswords[];
  userId: string;
}

function Wishlists({ wishlists, userId }: Props) {
  const handleLeaveWishlist = async (
    wishlist: Pick<Wishlist, 'id' | 'name'>,
  ) => {
    const result = await leaveWishlist({
      wishlistId: wishlist.id,
    });
    if (result?.error) {
      toast.error(result.error);
      toast.error('Something went wrong. Please try again.');
    } else {
      toast.success(`Left ${wishlist.name}!`);
    }
  };

  const handleJoinWishlist = async (
    formData: FormData,
    wishlist: WishlistsWithoutPasswords,
  ) => {
    const password = formData.get('password');
    const result = await joinWishlist({
      wishlistId: wishlist.id,
      password: password as string,
    });
    if (result?.error) {
      toast.error(result.error || 'Something went wrong.');
    } else {
      toast.success(`Joined ${wishlist.name}!`);
    }
  };

  const familyList = (wishlists: WishlistsWithoutPasswords[]) => {
    return wishlists.map((wishlist) => {
      const form = (
        <form
          action={(formData) => handleJoinWishlist(formData, wishlist)}
          className="justify-end flex gap-4 items-center"
          name={wishlist.id}
        >
          <Field>
            <Input
              autoComplete="off"
              inputMode="numeric"
              name="password"
              pattern="\d{1,4}"
              placeholder="Pin"
              type="number"
            />
          </Field>

          <Button type="submit">
            <UserPlusIcon />
            Join
          </Button>
        </form>
      );

      const membership = wishlist.members.find((m) => m.id === userId);
      const actionMarkup = membership ? (
        <Button onClick={() => handleLeaveWishlist(wishlist)} type="submit">
          <UserMinusIcon />
          Leave
        </Button>
      ) : (
        form
      );

      return (
        <TableRow key={wishlist.id}>
          <TableCell>
            <div className="flex items-center gap-4">
              <div>
                <Strong className="font-semibold text-lg">
                  {wishlist.name}
                </Strong>
                <div className="flex flex-row gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="gap-1 flex items-center">
                    <UsersIcon height={16} />
                    {wishlist._count.members} members
                  </div>
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell className="text-right">{actionMarkup}</TableCell>
        </TableRow>
      );
    });
  };

  return wishlists.length ? (
    <>
      <Heading>Available Wishlists</Heading>
      <Divider soft className="my-4" />
      <Text className="my-4">
        <Strong>A wishlist is a group of people</Strong> who share gift ideas
        with each other.
      </Text>
      <Text className="my-4">
        <Strong>Join a wishlist</Strong> to view people&apos;s gift ideas.
      </Text>
      <Table bleed>
        <TableBody>{familyList(wishlists)}</TableBody>
        <TableHead>
          <TableRow>
            <TableHeader>Wishlist</TableHeader>
            <TableHeader className="text-right">Action</TableHeader>
          </TableRow>
        </TableHead>
      </Table>
    </>
  ) : (
    <EmptyState
      subtitle="Something is broken, talk to the webmaster"
      title="👨‍👩‍👧‍👦 No Wishlists Found"
    >
      <div className="p-4">The elves could not find any wishlists.</div>
    </EmptyState>
  );
}

export default Wishlists;
