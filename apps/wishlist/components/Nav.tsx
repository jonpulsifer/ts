'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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
      link: '/user/me',
      icon: faUser,
    },
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
      'p-2 text-lg font-semibold transition ease-in-out duration-150 rounded-md hover:shadow-sm hover:shadow-gray-300 hover:bg-white hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:shadow-black';
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
              ? `${linkStyle} text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 shadow-sm`
              : linkStyle
          }
          key={link.title}
          href={link.link}
          prefetch={false}
        >
          <div
            className={`flex flex-row items-center justify-center ${
              isActive
                ? 'text-blue-600 dark:text-blue-600 dark:bg-gray-900'
                : ''
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

  const logoMarkup = (
    <div className="bg-[url('/santa.png')] items-center bg-contain bg-no-repeat bg-right-top h-24 flex flex-row space-x-4 p-2">
      <h1
        className={`pl-4 select-none font-bold text-2xl text-black dark:text-gray-200`}
      >
        wishin.app
      </h1>
    </div>
  );

  return (
    <div
      className={`flex flex-col flex-grow min-h-full hidden sm:block border-r dark:border-gray-800 border-gray-300 w-60 transition-all duration-300 bg-gray-50 dark:bg-gray-900 dark:text-gray-400`}
    >
      {logoMarkup}
      <div className="flex flex-col">
        <nav className="flex flex-col space-y-2 p-2">{linksMarkup(links)}</nav>
        <nav className="flex flex-col bottom-0 fixed space-y-2 p-2">
          {linksMarkup(signOutLink)}
        </nav>
      </div>
    </div>
  );
}
