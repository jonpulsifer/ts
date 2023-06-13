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

export default function Nav() {
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
      'p-2 text-md font-semibold transition ease-in-out duration-150 rounded-md hover:shadow-sm hover:shadow-gray-300 hover:bg-white hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:shadow-black';
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
              ? `${linkStyle} text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 shadow-sm bg-slate-800`
              : linkStyle
          }
          key={link.title}
          href={link.link}
          prefetch={false}
          onClick={link.onClick}
        >
          <div
            className={`flex flex-row items-center justify-center ${
              isActive ? 'text-blue-600 dark:text-blue-600' : ''
            }`}
          >
            <div className="flex">
              <FontAwesomeIcon
                key={link.title}
                icon={link.icon}
                className="w-10 text-gray-600"
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
