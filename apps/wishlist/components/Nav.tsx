import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { useAuth } from './AuthProvider';

interface Props {
  title: string;
}

type NavLink = {
  title: string;
  link?: string;
  icon: string;
  onClick?: () => void;
};

export default function Nav({ title }: Props) {
  const [showNav, setShowNav] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const daysUntilChristmas = () => {
    const day = 1000 * 60 * 60 * 24;
    const d1 = new Date();
    const d2 = new Date(d1.getFullYear(), 11, 25);
    return Math.round(Math.abs((d2.getTime() - d1.getTime()) / day));
  };

  const links = [
    {
      title: 'Add Gift',
      link: '/gift/new',
      icon: 'fa-plus-square',
    },
    {
      title: 'Gifts',
      link: '/gifts',
      icon: 'fa-gifts',
    },
    {
      title: 'Claimed Gifts',
      link: '/claimed',
      icon: 'fa-list-check',
    },
    {
      title: 'People',
      link: '/people',
      icon: 'fa-people-group',
    },
    {
      title: 'My Wishlist',
      link: '/mine',
      icon: 'fa-person-rays',
    },
  ];

  const signOutLink = [
    {
      title: 'Profile',
      link: `/user/${user?.uid}`,
      icon: 'fa-user',
    },
    {
      title: 'Sign out',
      onClick: () =>
        signOut().then(() => {
          setShowNav(!showNav);
        }),
      icon: 'fa-sign-out',
    },
  ];

  const linksMarkup = (links: NavLink[]) => {
    const linx: JSX.Element[] = [];
    const linkStyle =
      'p-2 text-lg font-semibold transition ease-in-out duration-150 rounded-md hover:shadow-sm hover:shadow-gray-300 hover:bg-white hover:text-blue-600';
    links.forEach((link) => {
      if (!link.link) {
        linx.push(
          <a onClick={link.onClick} key={link.title} className={linkStyle}>
            <div className="flex flex-row items-center justify-center">
              <div className="flex">
                <i key={link.title} className={`fa ${link.icon} w-10`}></i>
              </div>
              <div className="flex flex-grow">{link.title}</div>
            </div>
          </a>,
        );
        return;
      }
      const isActive = router.asPath === link.link;
      linx.push(
        <Link key={link.title} href={link.link} prefetch={false}>
          <a
            onClick={() => setShowNav(!showNav)}
            key={link.title}
            className={
              isActive
                ? `${linkStyle} bg-white border border-gray-200 shadow-sm`
                : linkStyle
            }
          >
            <div
              className={`flex flex-row items-center justify-center ${
                isActive ? 'text-blue-600' : ''
              }`}
            >
              <div className="flex">
                <i
                  key={link.title}
                  className={`fa ${link.icon} w-10 text-gray-600`}
                ></i>
              </div>
              <div className="flex flex-grow">{link.title}</div>
            </div>
          </a>
        </Link>,
      );
    });
    return linx;
  };

  const burgerButton = (
    <button className="" onClick={() => setShowNav(!showNav)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );

  const logoMarkup = (
    <div
      onClick={() => setShowNav(!showNav)}
      className="bg-[url('/santa.png')] items-center bg-contain bg-no-repeat bg-right-top h-24 flex flex-row space-x-4 p-2"
    >
      <div className="">{burgerButton}</div>
      <h1 className="font-title select-none font-semibold text-xl text-black">
        wishin.app
      </h1>
    </div>
  );

  return (
    <>
      <header className="flex w-full bg-white items-center p-2 text-semibold border-b border-transparent space-x-2">
        {burgerButton}
        <h1 className="flex truncate font-semibold text-lg noselect">
          {title}
        </h1>
        <div className="flex flex-1 truncate justify-end">
          <p className="text-xs text-right truncate">
            <span className="font-semibold text-blue-600">
              {daysUntilChristmas()}
            </span>{' '}
            days until Christmas
          </p>
        </div>
      </header>
      <aside
        className={`flex flex-col absolute z-10 min-h-screen h-full border-r border-gray-300 w-60 h-full transition-all duration-300 bg-gray-50 overflow-y-auto ${
          !showNav ? '-ml-60' : ''
        }`}
      >
        {logoMarkup}
        <nav className="flex flex-col flex-1 space-y-2 p-2">
          {linksMarkup(links)}
        </nav>
        <nav className="flex flex-col flex-end pb-20 space-y-2 p-2">
          {linksMarkup(signOutLink)}
        </nav>
      </aside>
    </>
  );
}
