'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from './AuthProvider';
import Modal from './GiftModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGifts,
  faListCheck,
  faPeopleGroup,
  faPersonRays,
  faPlusSquare,
  faSignOut,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

type NavLink = {
  title: string;
  href?: string;
  icon: IconDefinition;
  onClick?: () => void;
};

export function Sidebar() {
  const { signOut } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [showGiftModal, setShowGiftModal] = useState(false);
  const links = [
    {
      title: 'Add Gift',
      href: '#',
      onClick: () => setShowGiftModal(true),
      icon: faPlusSquare,
    },
    {
      title: 'Gifts',
      href: '/gifts',
      icon: faGifts,
    },
    {
      title: 'People',
      href: '/people',
      icon: faPeopleGroup,
    },
    {
      title: 'Claimed',
      href: '/claimed',
      icon: faListCheck,
    },
    {
      title: 'Profile',
      href: '/user/me',
      icon: faPersonRays,
    },
  ];

  const signOutLink = [
    {
      title: 'Sign out',
      onClick: () =>
        signOut().then(() => {
          router.push('/');
        }),
      icon: faSignOut,
    },
  ];

  const linksMarkup = (links: NavLink[]) => {
    const linx: JSX.Element[] = [];
    const linkStyle =
      'p-2 text-md font-semibold transition ease-in-out duration-150 rounded-md hover:shadow-sm hover:shadow-gray-300 hover:bg-white hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:shadow-black';
    links.forEach((link) => {
      if (!link.href) {
        linx.push(
          <Link
            href="#"
            onClick={link.onClick}
            key={link.title}
            className={linkStyle}
          >
            <div className="flex flex-row items-center justify-center">
              <div className="flex">
                <FontAwesomeIcon
                  icon={link.icon}
                  className="w-10"
                  key={link.title}
                />
              </div>
              <div className="flex flex-grow">{link.title}</div>
            </div>
          </Link>,
        );
        return;
      }
      const isActive = path === link.href;
      linx.push(
        <Link
          className={
            isActive
              ? `${linkStyle} text-gray-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500 shadow-sm bg-gray-100 dark:bg-slate-800 dark:bg-opacity-50`
              : linkStyle
          }
          key={link.title}
          href={link.href}
          prefetch={false}
          onClick={link.onClick}
        >
          <div
            className={`flex flex-row items-center justify-center ${
              isActive ? 'text-indigo-600 dark:text-indigo-500' : ''
            }`}
          >
            <div className="flex">
              <FontAwesomeIcon
                key={link.title}
                icon={link.icon}
                className="w-10 text-gray-600 dark:text-slate-400"
              />
            </div>
            <div className="flex flex-grow">{link.title}</div>
          </div>
        </Link>,
      );
    });
    return linx;
  };

  return (
    <div className="flex flex-col h-full flex-none hidden sm:block border-r dark:border-slate-800 border-gray-300 w-60 transition-all duration-300 bg-gray-50 dark:bg-slate-900 dark:text-slate-200 bg-[url('/santa.png')] bg-no-repeat bg-right-top">
      <nav className="flex flex-col flex-none space-y-2 p-2">
        {linksMarkup(links)}
      </nav>
      <nav className="flex flex-col grow-2 space-y-2 p-2 ">
        {linksMarkup(signOutLink)}
      </nav>
      <Modal isOpen={showGiftModal} setIsOpen={setShowGiftModal} />
    </div>
  );
}

export function BottomNav() {
  const [showGiftModal, setShowGiftModal] = useState(false);
  const path = usePathname();
  const links = [
    {
      title: 'Gifts',
      href: '/gifts',
      icon: faGifts,
    },
    {
      title: 'People',
      href: '/people',
      icon: faPeopleGroup,
    },
    {
      title: 'Add',
      href: '#',
      onClick: () => setShowGiftModal(true),
      icon: faPlusSquare,
    },
    {
      title: 'Claimed',
      href: '/claimed',
      icon: faListCheck,
    },

    {
      title: 'Profile',
      href: '/user/me',
      icon: faPersonRays,
    },
  ];
  const buttons = (links: NavLink[]) => {
    const buttonClass =
      'inline-flex flex-col text-gray-500 dark:text-slate-400 dark:bg-slate-950 items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-slate-900 dark:hover:bg-slate-900 dark:hover:bg-opacity-75 group';
    const iconClass =
      'w-6 h-6 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-500';
    const labelClass =
      'text-sm font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-500';

    const btns = links.map((link) => {
      // add hover style if link is active
      const isActive = path === link.href;
      // log object with isactive and the path and some extra info
      if (isActive) console.log({ isActive, path, link });

      const href = link.href ? link.href : '#';
      return (
        <button
          type="button"
          className={
            isActive
              ? `${buttonClass} bg-gray-50 text-indigo-600 dark:text-indigo-400`
              : buttonClass
          }
          key={link.title}
        >
          <Link
            href={href}
            className="flex flex-col items-center"
            prefetch={false}
            onClick={link.onClick ? link.onClick : undefined}
          >
            <FontAwesomeIcon
              icon={link.icon}
              className={
                isActive
                  ? `${iconClass} text-indigo-600 dark:text-indigo-400`
                  : iconClass
              }
              fill="currentColor"
            />
            <span
              className={
                isActive
                  ? `${labelClass} text-indigo-600 dark:text-indigo-400`
                  : labelClass
              }
            >
              {link.title}
            </span>
          </Link>
        </button>
      );
    });
    return btns;
  };

  return (
    <div className="fixed block sm:hidden bottom-0 w-full h-20 bg-gray-50 border-t border-slate-200 dark:bg-slate-950 dark:border-slate-800 bg-[url('/santa.png')] bg-contain bg-no-repeat bg-right-top">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto opacity-100">
        {buttons(links)}
      </div>
      <Modal isOpen={showGiftModal} setIsOpen={setShowGiftModal} />
    </div>
  );
}
