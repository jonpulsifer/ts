'use client';

import { Link } from '@repo/ui/link';
import { Gift, ListChecks, PlusSquare, UserCog, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import Modal from './GiftModal';

export function BottomNav() {
  const [showGiftModal, setShowGiftModal] = useState(false);
  const path = usePathname();
  const links = [
    {
      title: 'Gifts',
      href: '/gifts',
      icon: Gift,
    },
    {
      title: 'People',
      href: '/people',
      icon: Users,
    },
    {
      title: 'Add',
      href: '#',
      onClick: () => {
        setShowGiftModal(true);
      },
      icon: PlusSquare,
    },
    {
      title: 'Claimed',
      href: '/claimed',
      icon: ListChecks,
    },

    {
      title: 'Profile',
      href: '/user/me',
      icon: UserCog,
    },
  ];

  const styles = {
    activeButtonClass:
      'bg-gray-50 text-indigo-600 dark:text-indigo-500 border-t-2 border-indigo-500 dark:border-indigo-500',
    buttonClass:
      'inline-flex flex-col text-gray-900 dark:text-slate-400 dark:bg-slate-950 items-center justify-center px-5 group border-indigo-950 hover:border-t-2 hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-500 transition ease-in-out hover:duration-150',
    iconClass: 'w-6 h-6 text-xl',
    iconActiveClass: 'text-indigo-600 dark:text-indigo-400',
    labelClass: 'text-xs font-bold',
    hoverClass: '',
  };

  const buttons = links.map((link) => {
    // if path contains href then we are on the active link
    const href = link.href ? link.href : '#';
    const isActive = path && path.includes(href);
    const isAdd = link.title === 'Add';
    return (
      <button
        className={
          isActive
            ? `${styles.buttonClass} ${styles.activeButtonClass}`
            : styles.buttonClass
        }
        key={link.title}
        type="button"
      >
        <Link
          className="flex flex-col items-center gap-1"
          href={href}
          onClick={link.onClick ? link.onClick : undefined}
          prefetch={false}
        >
          <div
            className={
              isActive || isAdd
                ? `${styles.iconClass} ${styles.iconActiveClass}`
                : styles.iconClass
            }
          >
            <link.icon />
          </div>
          <span
            className={
              isActive || isAdd
                ? `${styles.labelClass} ${styles.iconActiveClass}`
                : styles.labelClass
            }
          >
            {link.title}
          </span>
        </Link>
      </button>
    );
  });

  return (
    <div className="fixed bottom-0 w-full h-16 bg-gray-50 border-t border-gray-200 dark:bg-slate-950 dark:border-slate-800 xs:rounded-t-lg">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">{buttons}</div>
      <Modal isOpen={showGiftModal} setIsOpen={setShowGiftModal} />
    </div>
  );
}
