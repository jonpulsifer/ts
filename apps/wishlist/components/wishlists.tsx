'use client';

import type { Prisma } from '@prisma/client';
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
  TableRow,
  Text,
} from '@repo/ui';
import { joinWishlist, leaveWishlist } from 'app/actions';
import { DoorOpen, HeartHandshake } from 'lucide-react';
import { toast } from 'react-hot-toast';

import EmptyState from './EmptyState';

type UserWithWishlists = Prisma.UserGetPayload<{
  include: { wishlists: true };
}>;

type WishlistsWithoutPasswords = Prisma.WishlistGetPayload<{
  select: { id: true; name: true };
}>;

interface Props {
  wishlists: WishlistsWithoutPasswords[];
  user: UserWithWishlists;
}

function Wishlists({ wishlists, user }: Props) {
  const handleLeaveWishlist = async (wishlist: WishlistsWithoutPasswords) => {
    const result = await leaveWishlist({
      userId: user.id,
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
      userId: user.id,
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
          className="flex flex-row items-center"
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

          <Button className="ml-4 w-24" type="submit">
            <HeartHandshake />
            Join
          </Button>
        </form>
      );

      const inWishlist = user.wishlists.find((w) => w.id === wishlist.id);
      const actionMarkup = inWishlist ? (
        <Button
          onClick={() => handleLeaveWishlist(inWishlist)}
          className="ml-4 w-24"
          type="submit"
        >
          <DoorOpen />
          Leave
        </Button>
      ) : (
        form
      );

      return (
        <TableRow key={`${wishlist.name}-${wishlist.id}`}>
          <TableCell>
            <div className="flex items-center p-2 px-4">
              <div className="mr-4 sm:flex inline-flex overflow-hidden relative justify-center items-center w-10 h-10 rounded-full bg-indigo-100 dark:bg-gray-800">
                <span className="font-medium text-violet-600 dark:text-violet-500">
                  {wishlist.name[0].toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-semibold text-xl">{wishlist.name}</div>
              </div>
              <div className="flex flex-grow text-right justify-end">
                {actionMarkup}
              </div>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  };

  return wishlists.length ? (
    <>
      <Heading>Available Wishlists</Heading>
      <Divider soft className="my-4" />
      <Text className="my-4">
        <Strong>Join a wishlist</Strong> to see what your family wants for the
        holidays.
      </Text>
      <Table>
        <TableBody>{familyList(wishlists)}</TableBody>
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
