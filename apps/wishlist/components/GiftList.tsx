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
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { GiftWithOwner } from 'types/prisma';
import { Card } from 'ui';

import { BadgeCounter } from './BadgeCounter';
import DeleteModal from './DeleteModal';
import EmptyState from './EmptyState';
import Modal from './GiftModal';
import Spinner from './Spinner';

interface Props {
  gifts: GiftWithOwner[];
}

const GiftList = ({ gifts }: Props) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gift, setGift] = useState<GiftWithOwner | null>(null);
  const path = usePathname();
  const router = useRouter();

  const { data: session, status } = useSession();
  const user = session?.user;
  if (!user || status === 'loading') return <Spinner />;
  if (status === 'unauthenticated') {
    toast.error('You must be logged in to view this page');
    router.push('/login');
  }

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
      case `/user/${user.id}`:
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

  if (!gifts || !gifts.length) {
    return (
      <>
        {getEmptyState()}
        <Modal isOpen={modalIsOpen} setIsOpen={setIsOpen} />
      </>
    );
  }

  const handleClaim = (gift: GiftWithOwner) => {
    fetch(`/api/gift/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: gift.id }),
    })
      .then((res) => {
        if (res.status === 200) {
          toast.success(`Claimed ${gift.name}`);
          router.refresh();
        } else {
          res.json().then((json) => toast.error(json.error));
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleUnclaim = (gift: GiftWithOwner) => {
    fetch(`/api/gift/claim`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: gift.id }),
    })
      .then((res) => {
        if (res.status === 200) {
          toast.success(`Unclaimed ${gift.name}`);
          router.refresh();
        } else {
          res.json().then((json) => toast.error(json.error));
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleConfirmDelete = (gift: GiftWithOwner) => {
    setGift(gift);
    setShowDeleteModal(true);
  };

  const handleActualDelete = (gift: GiftWithOwner) => {
    fetch('/api/gift', {
      method: 'DELETE',
      body: JSON.stringify({ id: gift.id }),
    })
      .then((res) => {
        if (res.ok) {
          toast.success(`Deleted ${gift.name}`);
          router.refresh();
        } else {
          toast.error('Something went wrong');
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });

    setGift(null);
  };

  const giftActions = (gift: GiftWithOwner) => {
    const buttonClass =
      'inline-flex items-center rounded-md px-3 py-2 font-semibold shadow-sm w-auto ring-1 ring-inset';
    const buttonInfo =
      'text-indigo-600 dark:text-indigo-100 hover:text-white dark:hover:text-indigo-500 bg-indigo-50 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/25 hover:bg-indigo-600 ring-indigo-700/10 dark:ring-indigo-600/20';
    const buttonDanger =
      'text-red-600 dark:text-red-100 hover:text-white dark:hover:text-red-500 bg-red-50 dark:bg-red-950/25 dark:hover:bg-red-950/25 hover:bg-red-600 ring-red-700/10 dark:ring-red-600/20';

    if (gift.ownerId === user.id)
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
    if (gift.claimedById && gift.claimedById !== user.id) return null;
    if (gift.claimedById === user.id) {
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

  const giftList = (gifts: GiftWithOwner[]) => {
    return gifts.map((gift) => {
      const notesMarkup = gift.description ? (
        <div className="text-xs text-gray-400 dark:text-gray-700 hover:text-indigo-600 hover:font-bold transition ease-in-out duration-200">
          {gift.description.length > 60
            ? `${gift.description.substring(0, 60)}...`
            : gift.description}
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
    gifts: GiftWithOwner[];
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
        key={gifts[0].ownerId}
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

  // create a hash of gifts by owner id
  const giftsByOwnerId = gifts.reduce(
    (acc, gift) => {
      const ownerId = gift.ownerId || user.id;
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
    const title = name ? `${name}'s Gifts` : 'Gifts';
    const subtitle = gifts.length > 1 ? 'Gifts' : 'Gift';
    const badges = BadgeCounter('gift', gifts);

    return (
      <GiftCard
        key={ownerId}
        gifts={gifts}
        title={title}
        subtitle={subtitle}
        badges={badges}
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
