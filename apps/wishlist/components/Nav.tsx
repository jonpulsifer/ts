'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

import { useAuth } from './AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGifts,
  faListCheck,
  faPeopleGroup,
  faPersonRays,
  faPlusSquare,
  faSignOut,
  faUser,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import Loading from './Spinner';
import { Finger_Paint } from '@next/font/google';
interface Props {
  title: string;
}

type NavLink = {
  title: string;
  link?: string;
  icon: IconDefinition;
  onClick?: () => void;
};

const daysUntilChristmas = () => {
  const today = new Date();
  const christmas = new Date(today.getFullYear(), 11, 25);
  if (today.getMonth() === 11 && today.getDate() > 25) {
    christmas.setFullYear(christmas.getFullYear() + 1);
  }
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.ceil((christmas.getTime() - today.getTime()) / oneDay);
};

const logoFont = Finger_Paint({ weight: '400' });
const logoStyle = `${logoFont.className} select-none font-semibold text-xl text-black`;

export default function Nav({ title }: Props) {
  const [showNav, setShowNav] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const path = usePathname();

  const links = [
    {
      title: 'Add Gift',
      link: '/gift/new',
      icon: faPlusSquare,
    },
    {
      title: 'Gifts',
      link: '/gifts',
      icon: faGifts,
    },
    {
      title: 'Claimed Gifts',
      link: '/claimed',
      icon: faListCheck,
    },
    {
      title: 'People',
      link: '/people',
      icon: faPeopleGroup,
    },
    {
      title: 'My Wishlist',
      link: '/mine',
      icon: faPersonRays,
    },
  ];

  const signOutLink = [
    {
      title: 'Profile',
      link: `/user/${user?.uid}`,
      icon: faUser,
    },
    {
      title: 'Sign out',
      onClick: () =>
        signOut().then(() => {
          setShowNav(!showNav);
          router.push('/');
        }),
      icon: faSignOut,
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
                <FontAwesomeIcon
                  icon={link.icon}
                  className="w-10"
                  key={link.title}
                />
              </div>
              <div className="flex flex-grow">{link.title}</div>
            </div>
          </a>,
        );
        return;
      }
      const isActive = path === link.link;
      linx.push(
        <Link
          className={
            isActive
              ? `${linkStyle} bg-white border border-gray-200 shadow-sm`
              : linkStyle
          }
          key={link.title}
          href={link.link}
          onClick={() => setShowNav(!showNav)}
          prefetch={false}
        >
          <div
            className={`flex flex-row items-center justify-center ${
              isActive ? 'text-blue-600' : ''
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
      <h1 className={logoStyle}>wishin.app</h1>
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
              {`${daysUntilChristmas()}`}
            </span>{' '}
            days until Christmas
          </p>
        </div>
      </header>
      <aside
        className={`top-0 flex flex-col absolute z-10 border-r border-gray-300 w-60 transition-all duration-300 bg-gray-50 overflow-y-auto ${
          !showNav ? '-ml-60' : ''
        }`}
      >
        {logoMarkup}
        <nav className="flex flex-col flex-1 space-y-2 p-2">
          {linksMarkup(links)}
        </nav>
        <Suspense fallback={<Loading />}>
          <nav className="flex flex-col flex-end pb-20 space-y-2 p-2">
            {linksMarkup(signOutLink)}
          </nav>
        </Suspense>
      </aside>
    </>
  );
}
