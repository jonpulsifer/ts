'use client';

import {
  faFeather,
  faLink,
  faMinusSquare,
  faPencil,
  faPlusSquare,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Gift, User } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Card } from '@repo/ui/card';
import type { GiftWithOwner } from 'types/prisma';
import { claimGift, deleteGift, unclaimGift } from 'app/actions';

interface Props {
  gift: Gift | GiftWithOwner;
  user: User;
}

export function GiftCard({ gift, user }: Props) {
  const { name, description, url } = gift;
  const router = useRouter();
  const giftDescription = description
    ? description
    : `${user.name} hasn't added a description for this gift.`;

  const { data: session } = useSession();
  const currentUser = session?.user as User;

  function ToastMarkup({ gift }: { gift: Gift }) {
    return (
      <button className="flex flex-row items-center space-x-4 h-max">
          <div className="flex h-max">
            Are you sure you want to delete {gift.name}?
          </div>
          <div
            className="flex pl-6 items-center border-l border-gray-300 h-16 hover:text-red-800 hover:drop-shadow transition ease-in-out duration-200 text-red-600 text-xs font-semibold uppercase"
            onClick={() => handleDelete(gift)}
          >
            delete
          </div>
        </button>
    );
  }

  const handleConfirmDelete = (gift: Gift) => {
    toast.error(<ToastMarkup gift={gift} />, {
      icon: (
        <FontAwesomeIcon
          className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-red-600 to-red-600"
          icon={faTrashCan}
        />
      ),
    });
  };

  const handleClaim = async (gift: Gift) => {
    const result = await claimGift(gift.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Claimed ${gift.name}!`);
    }
  };

  const handleUnclaim = async (gift: Gift) => {
    const result = await unclaimGift(gift.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Unclaimed ${gift.name}!`);
    }
  };

  const handleDelete = async (gift: Gift) => {
    const result = await deleteGift(gift.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Deleted ${gift.name}`);
      router.push('/user/me');
    }
  };

  const giftAction = () => {
    if (gift.ownerId === currentUser.id)
      return [
        {
          link: `/gift/${gift.id}/edit`,
          icon: faPencil,
          title: 'Edit Gift',
        },
        {
          onClick: () => { handleConfirmDelete(gift); },
          icon: faTrashCan,
          title: 'Delete Gift',
          danger: true,
        },
      ];
    if (gift.claimedById && gift.claimedById !== currentUser.id)
      return undefined;
    if (gift.claimedById === currentUser.id) {
      return {
        onClick: () => handleUnclaim(gift),
        icon: faMinusSquare,
        title: 'Unclaim Gift',
      };
    }
    return {
      onClick: () => handleClaim(gift),
      icon: faPlusSquare,
      title: 'Claim Gift',
    };
  };

  return (
    <Card action={giftAction()} subtitle={user.name} title={name}>
      <div className="p-4">
        <div className="flex flex-col space-y-4 truncate">
          {url ? (
            <div className="flex flex-col sm:flex-row">
              <div className="flex flex-row sm:shrink-0 sm:w-24 items-center space-x-2 mb-2 text-gray-600">
                <FontAwesomeIcon icon={faLink} />
                <p className="font-semibold">Link</p>
              </div>
              <div className="truncate">
                <Link
                  className="text-lg text-indigo-600 font-medium hover:text-indigo-600"
                  href={url}
                  target="gift"
                >
                  {url}
                </Link>
              </div>
            </div>
          ) : null}
          <div className="flex flex-col sm:flex-row items-start">
            <div className="flex flex-row sm:shrink-0 sm:w-24 items-center space-x-2 mb-2 text-gray-600">
              <FontAwesomeIcon icon={faFeather} />
              <p className="font-semibold">Notes</p>
            </div>
            <div className="whitespace-pre-line">{giftDescription}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
