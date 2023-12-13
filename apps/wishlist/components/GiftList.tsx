'use client';

import {
  faEdit,
  faGift,
  faMinusSquare,
  faPlusSquare,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { claimGift, deleteGift, unclaimGift } from 'app/actions';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { GiftWithOwner } from 'types/prisma';
import { Card } from 'ui';

import DeleteModal from './DeleteModal';
import EmptyState from './EmptyState';
import Modal from './GiftModal';

interface Props {
  gifts: GiftWithOwner[];
  currentUserId: string;
}

const GiftList = ({ gifts, currentUserId }: Props) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gift, setGift] = useState<GiftWithOwner | null>(null);
  const path = usePathname();

  const getEmptyState = () => {
    const currentUserGiftsMarkup = (
      <p>
        You haven&apos;t added any gifts,{' '}
        <Link
          className="font-semibold text-indigo-600"
          href=""
          onClick={() => setIsOpen(true)}
        >
          add one now!
        </Link>
      </p>
    );
    const currentUserStateProps = {
      title: '🎁 No Gifts Found',
      subtitle: 'You have not added any gifts to your wishlist',
      action: {
        title: 'Add one now!',
        onClick: () => {
          setIsOpen(true);
        },
        icon: faGift,
      },
    };
    const myGiftsMarkup = (
      <EmptyState {...currentUserStateProps}>
        <div className="p-4">{currentUserGiftsMarkup}</div>
      </EmptyState>
    );

    switch (path) {
      case `/user/${currentUserId}`:
        return myGiftsMarkup;
      case '/user/me':
        return myGiftsMarkup;
      case '/mine':
        return myGiftsMarkup;
    }
  };

  if (!gifts || !gifts.length) {
    return (
      <>
        {getEmptyState()}
        <Modal isOpen={modalIsOpen} setIsOpen={setIsOpen} />
      </>
    );
  }

  const handleClaim = async (gift: GiftWithOwner) => {
    const result = await claimGift(gift.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Claimed ${gift.name}!`);
    }
  };

  const handleUnclaim = async (gift: GiftWithOwner) => {
    const result = await unclaimGift(gift.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Unclaimed ${gift.name}!`);
    }
  };

  const handleConfirmDelete = (gift: GiftWithOwner) => {
    setGift(gift);
    setShowDeleteModal(true);
  };

  const handleActualDelete = async (formData: FormData) => {
    const giftId = formData.get('id');
    if (!giftId) return;
    const result = await deleteGift(giftId as string);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Deleted ${gift?.name || 'gift'}!`);
    }
    setGift(null);
  };

  const giftActions = (gift: GiftWithOwner) => {
    const buttonClass =
      'text-xs inline-flex items-center rounded-md px-3 py-2 font-semibold shadow-sm w-auto ring-1 ring-inset';
    const buttonInfo =
      'text-indigo-600 dark:text-indigo-100 hover:text-white dark:hover:text-indigo-500 bg-indigo-50 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/25 hover:bg-indigo-600 ring-indigo-700/10 dark:ring-indigo-600/20';
    const buttonDanger =
      'text-red-600 dark:text-red-100 hover:text-white dark:hover:text-red-500 bg-red-50 dark:bg-red-950/25 dark:hover:bg-red-950/25 hover:bg-red-600 ring-red-700/10 dark:ring-red-600/20';

    if (gift.ownerId === currentUserId)
      return (
        <div className="flex flex-row space-x-2">
          <Link href={`/gift/${gift.id}/edit`}>
            <button className={`${buttonClass} ${buttonInfo}`}>
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faEdit} />
                Edit
              </div>
            </button>
          </Link>
          <button
            className={`${buttonClass} ${buttonDanger}`}
            onClick={() => handleConfirmDelete(gift)}
          >
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faTrashCan} /> Delete
            </div>
          </button>
        </div>
      );
    if (gift.claimedById && gift.claimedById !== currentUserId) return null;
    if (gift.claimedById === currentUserId) {
      return (
        <button
          className={`${buttonClass} ${buttonDanger}`}
          onClick={() => handleUnclaim(gift)}
        >
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon={faMinusSquare} />
            Unclaim
          </div>
        </button>
      );
    }
    return (
      <button
        className={`${buttonClass} ${buttonInfo}`}
        onClick={() => handleClaim(gift)}
      >
        <div className="flex items-center gap-1">
          <FontAwesomeIcon icon={faPlusSquare} />
          Claim
        </div>{' '}
      </button>
    );
  };

  // create a hash of gifts by owner id
  const giftsByOwnerId = gifts.reduce(
    (acc, gift) => {
      const ownerId = gift.ownerId || currentUserId;
      const ownerGifts = acc[ownerId] || [];
      return {
        ...acc,
        [ownerId]: [...ownerGifts, gift],
      };
    },
    {} as { [key: string]: GiftWithOwner[] },
  );

  const giftCards = Object.keys(giftsByOwnerId).map((ownerId) => {
    const gifts = giftsByOwnerId[ownerId];
    const name = gifts[0].owner?.name || gifts[0].owner?.email;
    const giftList = gifts.map((gift) => {
      const notesMarkup = gift.description ? (
        <div className="text-xs text-gray-400 dark:text-gray-600 whitespace-nowrap truncate w-64">
          {gift.description}
        </div>
      ) : null;

      return (
        <tr
          key={gift.id}
          className="text-left border-t dark:border-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-500 transition ease-in-out duration-200"
        >
          <td className="px-4 py-1">
            <Link key={gift.id} href={`/gift/${gift.id}`}>
              <div className="flex flex-col">
                <div className="font-semibold text-base">{gift.name}</div>
                {notesMarkup}
              </div>
            </Link>
          </td>
          <td className="px-4 py-2">
            <div className="grid justify-items-end overflow-hidden">
              {giftActions(gift)}
            </div>
          </td>
        </tr>
      );
    });
    return (
      // add a key to the card
      <Card key={ownerId} title={`${name}'s gifts`}>
        <table className="table-auto w-full rounded-lg">
          <tbody>{giftList}</tbody>
        </table>
      </Card>
    );
  });

  return (
    <>
      {giftCards}
      <DeleteModal
        isOpen={showDeleteModal}
        setIsOpen={setShowDeleteModal}
        gift={gift}
        action={handleActualDelete}
      />
    </>
  );
};
export default GiftList;
