'use client';

import { deleteDoc, doc, FirestoreError, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { Gift } from '../types';

import { useAuth } from './AuthProvider';
import Card from './Card';
import Modal from './GiftModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinusSquare,
  faPlusSquare,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';

interface Props {
  gifts: Gift[];
}

const GiftList = ({ gifts: giftsFromProps }: Props) => {
  const [gifts, setGifts] = useState(giftsFromProps);
  const { user } = useAuth();
  const path = usePathname();
  const [modalIsOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setGifts(giftsFromProps);
  }, [giftsFromProps]);

  if (!user) return null;

  const noGiftText = () => {
    const defaultMarkup = (
      <p>
        The elves couldn&apos;t find any gifts in Santa&apos;s gift database.
        People need to add more gifts to their wishlists.
      </p>
    );
    const myGiftsMarkup = (
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
    if (!path) return defaultMarkup;
    switch (path) {
      case `/user/${user.uid}`:
        return myGiftsMarkup;
      case '/user/me':
        return myGiftsMarkup;
      case '/mine':
        return myGiftsMarkup;
      case path.match(/\/user\/\w+/)?.input:
        return (
          <p>
            This person has nothing left on their wishlist. You know what that
            means 🧦
          </p>
        );
      case '/claimed':
        return (
          <p>
            You haven&apos;t claimed any gifts. Go to the{' '}
            <Link className="font-semibold text-indigo-600" href="/gifts">
              gift list
            </Link>{' '}
            and claim one before they&apos;re all gone.
          </p>
        );
      default:
        return defaultMarkup;
    }
  };

  if (!gifts.length) {
    return (
      <>
        <Card title="🎁 No Gifts Found" subtitle="This wishlist is empty">
          <div className="p-4">{noGiftText()}</div>
        </Card>
        <Modal isOpen={modalIsOpen} setIsOpen={setIsOpen} />
      </>
    );
  }

  const removeGiftFromList = (gift: Gift, idx: number) => {
    const localGiftsCopy = [...gifts];
    localGiftsCopy.splice(idx, 1);
    setGifts(localGiftsCopy);
  };

  const handleClaim = (gift: Gift, idx: number) => {
    const ref = doc(db, 'gifts', gift.id);
    setDoc(ref, { claimed_by: user.uid }, { merge: true })
      .then(() => {
        removeGiftFromList(gift, idx);
        toast.success(`Claimed ${gift.name}`);
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message);
      });
  };

  const ToastMarkup = ({ gift, idx }: { gift: Gift; idx: number }) => {
    return (
      <>
        <button className="flex items-center space-x-4 h-max">
          <div className="flex flex-0">
            Are you sure you want to delete {gift.name}?
          </div>
          <div
            onClick={() => handleDelete(gift, idx)}
            className="flex flex-shrink-0 pl-4 items-center border-l border-gray-300 hover:text-red-800 hover:drop-shadow transition ease-in-out duration-200 text-red-600 text-xs font-semibold uppercase"
          >
            delete
          </div>
        </button>
      </>
    );
  };

  const handleConfirmDelete = (gift: Gift, idx: number) => {
    toast.error(<ToastMarkup gift={gift} idx={idx} />, {
      duration: 5000,
      icon: (
        <FontAwesomeIcon icon={faTrashCan} className="text-xl text-red-600" />
      ),
    });
  };

  const handleDelete = (gift: Gift, idx: number) => {
    const ref = doc(db, 'gifts', gift.id);
    deleteDoc(ref)
      .then(() => {
        removeGiftFromList(gift, idx);
        toast.success(`Deleted ${gift.name}`);
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message);
      });
  };

  const handleUnclaim = (gift: Gift, idx: number) => {
    const ref = doc(db, 'gifts', gift.id);
    setDoc(ref, { claimed_by: '' }, { merge: true })
      .then(() => {
        removeGiftFromList(gift, idx);
        toast.success(`Unclaimed ${gift.name}`);
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message);
      });
  };

  const giftActions = (gift: Gift, idx: number) => {
    if (gift.owner === user.uid)
      return (
        <button
          className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm dark:hover:bg-red-900 hover:bg-indigo-500 w-auto"
          onClick={() => handleConfirmDelete(gift, idx)}
        >
          <div className="flex">
            <FontAwesomeIcon icon={faTrashCan} className="pr-2" />
          </div>
          <div>Delete</div>
        </button>
      );
    if (gift.claimed_by && gift.claimed_by !== user.uid) return null;
    if (gift.claimed_by === user.uid) {
      return (
        <button
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          onClick={() => handleUnclaim(gift, idx)}
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
        onClick={() => handleClaim(gift, idx)}
      >
        <div className="flex">
          <FontAwesomeIcon icon={faPlusSquare} className="pr-2" />
        </div>
        <div>Claim</div>
      </button>
    );
  };

  const giftList = (gifts: Gift[]) => {
    return gifts.map((gift, idx) => {
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
            <Link href={`/gift/${gift.id}`}>
              <div className="flex flex-col">
                <div className="font-semibold text-lg">{name}</div>
                {notesMarkup}
              </div>
            </Link>
          </td>
          <td className="px-4 py-2">
            <div className="grid justify-items-end">
              {giftActions(gift, idx)}
            </div>
          </td>
        </tr>
      );
    });
  };

  const GiftCard = (gifts: Gift[], title: string | undefined) => {
    return (
      <Card title={title}>
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

  // return a card for each owner
  const giftCards = giftsByOwner.map((gifts) => {
    const bestGuessOwner =
      gifts
        .map((g) => g.owner_name)
        .filter((e) => e)
        .pop() || "Someone's";
    const isOwnerMe = gifts[0].owner === user.uid;
    const owner = isOwnerMe ? 'My' : `${bestGuessOwner}'s`;
    return GiftCard(gifts, `${owner} gifts`);
  });

  return giftCards;
};
export default GiftList;
