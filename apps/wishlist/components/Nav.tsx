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
  link?: string;
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
      link: '#',
      onClick: () => setShowGiftModal(true),
      icon: faPlusSquare,
    },
    {
      title: 'Gifts',
      link: '/gifts',
      icon: faGifts,
    },
    {
      title: 'Claimed',
      link: '/claimed',
      icon: faListCheck,
    },
    {
      title: 'People',
      link: '/people',
      icon: faPeopleGroup,
    },
    {
      title: 'My Profile',
      link: '/user/me',
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
      if (!link.link) {
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
      const isActive = path === link.link;
      linx.push(
        <Link
          className={
            isActive
              ? `${linkStyle} text-gray-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500 shadow-sm bg-gray-100 dark:bg-slate-800`
              : linkStyle
          }
          key={link.title}
          href={link.link}
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
    <>
      <div className="flex flex-col min-h-screen hidden sm:block border-r dark:border-gray-800 border-gray-300 w-60 transition-all duration-300 bg-gray-50 dark:bg-slate-900 dark:text-gray-300">
        <div className="flex flex-row h-24 p-2 items-center  bg-[url('/santa.png')] bg-contain bg-no-repeat bg-right-top">
          <h1 className="pl-4 select-none font-bold text-xl text-black dark:text-white">
            wishin.app
          </h1>
        </div>
        <nav className="flex flex-col space-y-2 p-2">{linksMarkup(links)}</nav>
        <nav className="flex flex-col space-y-2 p-2">
          {linksMarkup(signOutLink)}
        </nav>
      </div>
      <Modal isOpen={showGiftModal} setIsOpen={setShowGiftModal} />
    </>
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
  const buttonClass =
    'inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-slate-800 group';
  const iconClass =
    'w-6 h-6 mb-1 text-gray-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500';
  const labelClass =
    'text-sm font-semibold text-gray-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500';

  const buttons = links.map((link) => {
    // add hover style if link is active
    const isActive = path === link.href;

    return (
      <button
        type="button"
        className={
          isActive ? `${buttonClass} bg-gray-50 dark:bg-slate-800` : buttonClass
        }
      >
        <Link
          href={link.href}
          className="flex flex-col items-center"
          prefetch={true}
          onClick={link.onClick ? link.onClick : undefined}
        >
          <FontAwesomeIcon
            icon={link.icon}
            className={
              isActive
                ? `${iconClass} text-indigo-600 dark:text-indigo-500`
                : iconClass
            }
            fill="currentColor"
          />
          <span
            className={
              isActive
                ? `${labelClass} text-indigo-600 dark:text-indigo-500`
                : labelClass
            }
          >
            {link.title}
          </span>
        </Link>
      </button>
    );
  });

  return (
    <div className="fixed block sm:hidden bottom-0 w-full h-20 bg-white border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">{buttons}</div>
      <Modal isOpen={showGiftModal} setIsOpen={setShowGiftModal} />
    </div>
  );
}
