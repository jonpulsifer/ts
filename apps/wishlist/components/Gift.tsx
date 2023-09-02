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
import { deleteDoc, doc, FirestoreError, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Card } from 'ui';

import { db } from '../lib/firebase';
import { AppUser, Gift } from '../types';
import { useAuth } from './AuthProvider';

interface Props {
  gift: Gift;
  user: AppUser;
}

export const GiftCard = ({ gift, user }: Props) => {
  const { name, notes, url } = gift;
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const notesContent = notes
    ? notes
    : `${user.name} hasn't added any notes for this gift.`;

  const ToastMarkup = ({ gift }: { gift: Gift }) => {
    return (
      <>
        <button className="flex flex-row items-center space-x-4 h-max">
          <div className="flex h-max">
            Are you sure you want to delete {gift.name}?
          </div>
          <div
            onClick={() => handleDelete(gift)}
            className="flex pl-6 items-center border-l border-gray-300 h-16 hover:text-red-800 hover:drop-shadow transition ease-in-out duration-200 text-red-600 text-xs font-semibold uppercase"
          >
            delete
          </div>
        </button>
      </>
    );
  };

  const handleConfirmDelete = (gift: Gift) => {
    toast.error(<ToastMarkup gift={gift} />, {
      icon: (
        <FontAwesomeIcon
          icon={faTrashCan}
          className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-red-600 to-red-600"
        />
      ),
    });
  };

  const handleDelete = (gift: Gift) => {
    const ref = doc(db, 'gifts', gift.id);
    deleteDoc(ref)
      .then(() => {
        toast.success(`Deleted ${gift.name}`);
        router.push('/mine');
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message);
      });
  };

  const handleClaim = (gift: Gift) => {
    const ref = doc(db, 'gifts', gift.id);
    updateDoc(ref, { claimed_by: currentUser?.uid })
      .then(() => {
        toast.success(`Claimed ${gift.name}`);
        router.refresh();
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message);
      });
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

  const giftAction = () => {
    if (gift.owner === currentUser?.uid)
      return [
        {
          link: `/gift/${gift.id}/edit`,
          icon: faPencil,
          title: 'Edit Gift',
        },
        {
          onClick: () => handleConfirmDelete(gift),
          icon: faTrashCan,
          title: 'Delete Gift',
          danger: true,
        },
      ];
    if (gift.claimed_by && gift.claimed_by !== currentUser?.uid)
      return undefined;
    if (gift.claimed_by === currentUser?.uid) {
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
    <Card title={name} subtitle={user.name} action={giftAction()}>
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
                  target="gift"
                  href={url}
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
            <div className="whitespace-pre-line">{notesContent}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
