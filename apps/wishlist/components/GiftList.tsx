'use client';

import { deleteDoc, doc, FirestoreError, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type { Gift } from '../types';

import { useAuth } from './AuthProvider';
import Card from './Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinusSquare,
  faPlusSquare,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';

interface Props {
  gifts: Gift[];
  title?: string;
}

const GiftList = ({ gifts: giftsFromProps, title }: Props) => {
  const [gifts, setGifts] = useState(giftsFromProps);
  const { user } = useAuth();
  const path = usePathname();

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
    if (!path) return defaultMarkup;
    switch (path) {
      case `/user/${user.uid}`:
        return (
          <p>
            You haven&apos;t added any gifts. Go to the{' '}
            <Link className="font-semibold text-blue-600" href="/gift/new">
              add gift page
            </Link>{' '}
            and add one now!
          </p>
        );
      case path.match(/\/user\/\w+/)?.input:
        return (
          <p>
            This person has nothing left on their wishlist. You know what that
            means 🧦
          </p>
        );
      case '/mine':
        return (
          <p>
            You haven&apos;t added any gifts. Go to the{' '}
            <Link className="font-semibold text-blue-600" href="/gift/new">
              add gift page
            </Link>{' '}
            and add one now!
          </p>
        );
      case '/claimed':
        return (
          <p>
            You haven&apos;t claimed any gifts. Go to the{' '}
            <Link className="font-semibold text-blue-600" href="/gifts">
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
      <Card title="🎁 No Gifts Found" subtitle="This wishlist is empty">
        <div className="p-4">{noGiftText()}</div>
      </Card>
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
        toast.success(`Claimed ${gift.name}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      });
  };

  const ToastMarkup = ({ gift, idx }: { gift: Gift; idx: number }) => {
    return (
      <>
        <button className="flex flex-row items-center space-x-4 h-max">
          <div className="flex h-max">
            Are you sure you want to delete {gift.name}?
          </div>
          <div
            onClick={() => handleDelete(gift, idx)}
            className="flex pl-6 items-center border-l border-gray-300 h-16 hover:text-red-800 hover:drop-shadow transition ease-in-out duration-200 text-red-600 text-xs font-semibold uppercase"
          >
            delete
          </div>
        </button>
      </>
    );
  };

  const handleConfirmDelete = (gift: Gift, idx: number) => {
    toast.error(<ToastMarkup gift={gift} idx={idx} />, {
      position: toast.POSITION.BOTTOM_CENTER,
      icon: (
        <FontAwesomeIcon
          icon={faTrashCan}
          className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-red-600 to-red-600"
        />
      ),
    });
  };

  const handleDelete = (gift: Gift, idx: number) => {
    const ref = doc(db, 'gifts', gift.id);
    deleteDoc(ref)
      .then(() => {
        removeGiftFromList(gift, idx);
        toast.success(`Deleted ${gift.name}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      });
  };

  const handleUnclaim = (gift: Gift, idx: number) => {
    const ref = doc(db, 'gifts', gift.id);
    setDoc(ref, { claimed_by: '' }, { merge: true })
      .then(() => {
        removeGiftFromList(gift, idx);
        toast.success(`Unclaimed ${gift.name}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      });
  };

  const giftActions = (gift: Gift, idx: number) => {
    if (gift.owner === user.uid)
      return (
        <div
          className="text-right"
          onClick={() => handleConfirmDelete(gift, idx)}
        >
          <FontAwesomeIcon
            icon={faTrashCan}
            className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-red-600 to-red-600"
          />
        </div>
      );
    if (gift.claimed_by && gift.claimed_by !== user.uid) return null;
    if (gift.claimed_by === user.uid) {
      return (
        <div onClick={() => handleUnclaim(gift, idx)}>
          <FontAwesomeIcon
            icon={faMinusSquare}
            className="text-3xl text-blue-600"
          />
        </div>
      );
    }
    return (
      <div onClick={() => handleClaim(gift, idx)}>
        <FontAwesomeIcon
          icon={faPlusSquare}
          className="text-3xl text-blue-600"
        />
      </div>
    );
  };

  const giftList = (gifts: Gift[]) => {
    return gifts.map((gift, idx, { length }) => {
      const { id, name, owner_name } = gift;
      const isLast = length - 1 === idx;
      return (
        <tr
          key={id}
          className="border-t dark:border-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition ease-in-out duration-300"
        >
          <td className={`px-4 py-2 ${isLast ? 'rounded-bl-lg' : ''}`}>
            <Link href={`/gift/${gift.id}`}>
              <div className="flex flex-col">
                <div className="font-semibold text-xl">{name}</div>
                <div className="text-xs text-gray-400">{owner_name}</div>
              </div>
            </Link>
          </td>
          <td className={`px-4 py-2 ${isLast ? 'rounded-br-lg' : ''}`}>
            <div className="text-right">{giftActions(gift, idx)}</div>
          </td>
        </tr>
      );
    });
  };

  const GiftCard = (gifts: Gift[], title: string | undefined) => {
    return (
      <Card title={title}>
        <table className="table-auto w-full rounded-lg">
          <thead className="">
            <tr className="">
              <th className="px-4 pt-2 text-left text-xl">Gift Name</th>
              <th className="px-4 pt-2 text-right flex-end text-xl">Action</th>
            </tr>
          </thead>
          <tbody className="rounded rounded-xl">{giftList(gifts)}</tbody>
        </table>
      </Card>
    );
  };

  // get owners of gifts
  const owners = gifts.map((gift) => gift.owner);

  // remove duplicates
  const uniqueOwners = [...new Set(owners)];

  // create an array of gifts for each owner
  const giftsByOwner = uniqueOwners.map((owner) => {
    return gifts.filter((gift) => gift.owner === owner);
  });

  // return a card for each owner
  const giftCards = giftsByOwner.map((gifts) => {
    return GiftCard(gifts, gifts[0].owner_name);
  });

  return <>{giftCards}</>;
};
export default GiftList;
