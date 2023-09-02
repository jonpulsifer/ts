'use client';

import {
  faEdit,
  faGift,
  faGifts,
  faMinusSquare,
  faPlusSquare,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { deleteDoc, doc, FirestoreError, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card } from 'ui';

import { db } from '../lib/firebase';
import type { Gift } from '../types';
import { useAuth } from './AuthProvider';
import DeleteModal from './DeleteModal';
import EmptyState from './EmptyState';
import Modal from './GiftModal';

interface Props {
  gifts: Gift[];
}

const GiftList = ({ gifts }: Props) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gift, setGift] = useState<Gift | null>(null);
  const path = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  const getEmptyState = () => {
    const defaultMarkup = (
      <p>
        People need to{' '}
        <span className="font-semibold text-black dark:text-slate-200">
          add more gifts
        </span>{' '}
        to their wishlists
      </p>
    );
    const defaultStateProps = {
      title: '🎁 No Gifts Found',
      subtitle: 'People need to add more gifts to their wishlists',
      action: {
        title: 'Add one now!',
        onClick: () => setIsOpen(true),
        icon: faGift,
      },
    };
    const defaultEmptyState = (
      <EmptyState {...defaultStateProps}>
        <div className="p-4">{defaultMarkup}</div>
      </EmptyState>
    );
    if (!path) return defaultEmptyState;

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
          console.log('clicked');
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
      case `/user/${user.uid}`:
        return myGiftsMarkup;
      case '/user/me':
        return myGiftsMarkup;
      case '/mine':
        return myGiftsMarkup;
      case path.match(/\/user\/\w+/)?.input:
        return (
          <EmptyState
            title="🎁 No Gifts Found"
            subtitle="The elves could not find any gifts for this person"
          >
            <div className="p-4">{defaultMarkup}</div>
          </EmptyState>
        );
      case '/claimed':
        // return the state for the claimed route
        return (
          <EmptyState
            title="🛒 No Claimed Gifts"
            subtitle="You have not claimed any gifts"
            action={{
              title: 'View gifts',
              link: '/gifts',
              icon: faGifts,
            }}
          >
            <div className="p-4">
              <p>
                <span className="font-semibold dark:text-slate-200 text-black dark:text-slate-200">
                  Claim a gift
                </span>{' '}
                before they&apos;re all gone.
              </p>
            </div>
          </EmptyState>
        );
      default:
        return defaultEmptyState;
    }
  };

  if (!gifts.length) {
    return (
      <>
        {getEmptyState()}
        <Modal isOpen={modalIsOpen} setIsOpen={setIsOpen} />
      </>
    );
  }

  const handleClaim = (gift: Gift) => {
    const ref = doc(db, 'gifts', gift.id);
    updateDoc(ref, { claimed_by: user.uid })
      .then(() => {
        toast.success(`Claimed ${gift.name}`);
        router.refresh();
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message);
      });
  };

  const handleConfirmDelete = (gift: Gift) => {
    setGift(gift);
    setShowDeleteModal(true);
  };

  const handleActualDelete = (gift: Gift) => {
    const ref = doc(db, 'gifts', gift.id);
    deleteDoc(ref)
      .then(() => {
        toast.success(`Deleted ${gift.name}`);
        router.refresh();
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message);
      });
    setGift(null);
  };

  const handleUnclaim = (gift: Gift) => {
    const ref = doc(db, 'gifts', gift.id);
    updateDoc(ref, { claimed_by: '' })
      .then(() => {
        toast.success(`Unclaimed ${gift.name}`);
        router.refresh();
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message);
      });
  };

  const giftActions = (gift: Gift) => {
    const buttonClass =
      'inline-flex items-center rounded-md px-3 py-2 font-semibold shadow-sm w-auto ring-1 ring-inset';
    const buttonInfo =
      'text-indigo-600 dark:text-indigo-100 hover:text-white dark:hover:text-indigo-500 bg-indigo-50 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/25 hover:bg-indigo-600 ring-indigo-700/10 dark:ring-indigo-600/20';
    const buttonDanger =
      'text-red-600 dark:text-red-100 hover:text-white dark:hover:text-red-500 bg-red-50 dark:bg-red-950/25 dark:hover:bg-red-950/25 hover:bg-red-600 ring-red-700/10 dark:ring-red-600/20';

    if (gift.owner === user.uid)
      return (
        <div className="flex flex-row space-x-2">
          <Link href={`/gift/${gift.id}/edit`}>
            <button className={`${buttonClass} ${buttonInfo}`}>
              <div className="flex">
                <FontAwesomeIcon icon={faEdit} />
              </div>
            </button>
          </Link>
          <button
            className={`${buttonClass} ${buttonDanger}`}
            onClick={() => handleConfirmDelete(gift)}
          >
            <div className="flex">
              <FontAwesomeIcon icon={faTrashCan} />
            </div>
          </button>
        </div>
      );
    if (gift.claimed_by && gift.claimed_by !== user.uid) return null;
    if (gift.claimed_by === user.uid) {
      return (
        <button
          className={`${buttonClass} ${buttonDanger}`}
          onClick={() => handleUnclaim(gift)}
        >
          <div className="flex">
            <FontAwesomeIcon icon={faMinusSquare} />
          </div>
        </button>
      );
    }
    return (
      <button
        className={`${buttonClass} ${buttonInfo}`}
        onClick={() => handleClaim(gift)}
      >
        <div className="flex">
          <FontAwesomeIcon icon={faPlusSquare} />
        </div>
      </button>
    );
  };

  const giftList = (gifts: Gift[]) => {
    return gifts.map((gift) => {
      const notesMarkup = gift.notes ? (
        <div className="text-xs text-gray-400 dark:text-gray-700 hover:text-indigo-600 hover:font-bold transition ease-in-out duration-200">
          {gift.notes.length > 60
            ? `${gift.notes.substring(0, 60)}...`
            : gift.notes}
        </div>
      ) : null;

      return (
        <tr
          key={gift.id}
          className="text-left border-t dark:border-gray-800 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500"
        >
          <td className="px-4 py-2">
            <Link key={gift.id} href={`/gift/${gift.id}`}>
              <div className="flex flex-col">
                <div className="font-semibold text-lg">{gift.name}</div>
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
  };

  interface GiftCardProps {
    gifts: Gift[];
    title: React.ReactNode | undefined;
    subtitle?: React.ReactNode;
    badges?: React.ReactNode;
  }

  const GiftCard = ({
    gifts,
    title,
    subtitle = undefined,
    badges = undefined,
  }: GiftCardProps) => {
    return (
      <Card
        key={gifts[0].owner}
        title={title}
        subtitle={subtitle}
        badges={badges}
      >
        <table className="table-auto w-full rounded-lg">
          <tbody>{giftList(gifts)}</tbody>
        </table>
      </Card>
    );
  };

  // get owners of gifts
  const owners = gifts.map((gift) => gift.owner);

  // remove duplicates
  const uniqueOwners = [...new Set(owners)];

  // create an array of gifts for each owner, sorted by owner
  const giftsByOwner = uniqueOwners.sort().map((owner) => {
    return gifts.filter((gift) => gift.owner === owner);
  });

  // return a badge with the gift count
  const GiftCountBadge = (gifts: Gift[]) => {
    const count = gifts.length;
    const baseFontColor =
      'text-indigo-700 dark:text-indigo-500 bg-indigo-50 dark:bg-slate-950 ring-indigo-700/10 dark:ring-indigo-500/10';
    const fontColor =
      count > 0 && count < 3
        ? 'text-red-700 dark:text-red-500 bg-red-50 dark:bg-red-950 ring-red-700/10 dark:ring-red-500/10'
        : count > 2 && count < 5
        ? 'text-yellow-700 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950 ring-yellow-700/10 dark:ring-yellow-500/10'
        : count > 4
        ? 'text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950 ring-green-700/10 dark:ring-green-500/10'
        : baseFontColor;
    const baseClass = `flex-none w-16 justify-center inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${fontColor}`;

    return (
      <div className={baseClass}>
        {count} gift{count > 1 ? 's' : ''}
      </div>
    );
  };

  // return a card for each owner
  const giftCards = giftsByOwner.map((gifts) => {
    const owner = gifts
      .map((g) => g.owner_name)
      .filter((e) => e)
      .pop();
    const isOwnerMe = gifts[0].owner === user.uid;
    return (
      <GiftCard
        key={gifts[0].owner}
        gifts={gifts}
        title={owner ? `${owner}'s Gifts` : 'My Gifts'}
        subtitle={isOwnerMe ? 'Find all your gifts below' : undefined}
        badges={GiftCountBadge(gifts)}
      />
    );
  });

  return (
    <>
      {giftCards}
      {gift && (
        <DeleteModal
          isOpen={showDeleteModal}
          setIsOpen={setShowDeleteModal}
          gift={gift}
          onClick={() => handleActualDelete(gift)}
        />
      )}
    </>
  );
};
export default GiftList;
