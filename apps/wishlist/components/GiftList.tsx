'use client';

import { deleteDoc, doc, FirestoreError, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { Gift } from '../types';

import { useAuth } from './AuthProvider';
import Card from './Card';
import Modal from './GiftModal';
import DeleteModal from './DeleteModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGift,
  faMinusSquare,
  faPlusSquare,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import EmptyState from './EmptyState';
import { useRouter } from 'next/navigation';

interface Props {
  gifts: Gift[];
}

const GiftList = ({ gifts: giftsFromProps }: Props) => {
  const [gifts, setGifts] = useState(giftsFromProps);
  const { user } = useAuth();
  const path = usePathname();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gift, setGift] = useState<Gift | null>(null);
  const router = useRouter();

  useEffect(() => {
    setGifts(giftsFromProps);
  }, [giftsFromProps]);

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
      subtitle: "You haven't added any gifts to your wishlist",
      action: {
        title: 'Add one now!',
        onClick: () => setIsOpen(true),
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
            subtitle="The elves couldn't find any gifts for this person"
          >
            <div className="p-4">{defaultMarkup}</div>
          </EmptyState>
        );
      case '/claimed':
        // return the state for the claimed route
        return (
          <EmptyState
            title="🎁 No Gifts Found"
            subtitle="You haven't claimed any gifts"
            action={{
              title: 'View all gifts',
              link: '/gifts',
              icon: faGift,
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
    setDoc(ref, { claimed_by: user.uid }, { merge: true })
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
  };

  const handleUnclaim = (gift: Gift) => {
    const ref = doc(db, 'gifts', gift.id);
    setDoc(ref, { claimed_by: '' }, { merge: true })
      .then(() => {
        toast.success(`Unclaimed ${gift.name}`);
        router.refresh();
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message);
      });
  };

  const giftActions = (gift: Gift) => {
    if (gift.owner === user.uid)
      return (
        <button
          className="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white dark:text-red-600 shadow-sm dark:hover:bg-red-900 hover:dark:text-slate-200 hover:bg-red-600 w-auto"
          onClick={() => handleConfirmDelete(gift)}
        >
          <div className="flex">
            <FontAwesomeIcon icon={faTrashCan} className="" />
          </div>
        </button>
      );
    if (gift.claimed_by && gift.claimed_by !== user.uid) return null;
    if (gift.claimed_by === user.uid) {
      return (
        <button
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          onClick={() => handleUnclaim(gift)}
        >
          <div className="flex">
            <FontAwesomeIcon icon={faMinusSquare} className="pr-2" />
          </div>
          <div>Unclaim</div>
        </button>
      );
    }
    return (
      <button
        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 ml-3 w-auto"
        onClick={() => handleClaim(gift)}
      >
        <div className="flex">
          <FontAwesomeIcon icon={faPlusSquare} className="pr-2" />
        </div>
        <div>Claim</div>
      </button>
    );
  };

  const giftList = (gifts: Gift[]) => {
    return gifts.map((gift) => {
      const { id, name, notes } = gift;
      const notesMarkup = notes ? (
        <div className="text-xs text-gray-400 dark:text-gray-700 hover:text-indigo-600 hover:font-bold transition ease-in-out duration-200">
          {notes.length > 60 ? `${notes.substring(0, 60)}...` : notes}
        </div>
      ) : null;

      return (
        <tr
          key={id}
          className="text-left border-t dark:border-gray-800 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500"
        >
          <td className="px-4 py-2">
            <Link key={id} href={`/gift/${gift.id}`}>
              <div className="flex flex-col">
                <div className="font-semibold text-lg">{name}</div>
                {notesMarkup}
              </div>
            </Link>
          </td>
          <td className="px-4 py-2">
            <div className="grid justify-items-end">{giftActions(gift)}</div>
          </td>
        </tr>
      );
    });
  };

  const GiftCard = (
    gifts: Gift[],
    title: React.ReactNode | undefined,
    subtitle: React.ReactNode | undefined = undefined,
  ) => {
    return (
      <Card key={gifts[0].id} title={title} subtitle={subtitle}>
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
        : count > 4 && count < 7
        ? 'text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950 ring-green-700/10 dark:ring-green-500/10'
        : baseFontColor;
    const baseClass = `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${fontColor}`;

    return (
      <span className={baseClass}>
        {count} gift{count > 1 ? 's' : ''} available
      </span>
    );
  };

  // return a card for each owner
  const giftCards = giftsByOwner.map((gifts) => {
    const bestGuessOwner =
      gifts
        .map((g) => g.owner_name)
        .filter((e) => e)
        .pop() || "Someone's";
    const isOwnerMe = gifts[0].owner === user.uid;
    const owner = isOwnerMe ? 'My' : `${bestGuessOwner}'s`;
    return GiftCard(gifts, `${owner} gifts`, GiftCountBadge(gifts));
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
