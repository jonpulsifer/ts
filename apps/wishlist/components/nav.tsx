'use client';

import {
  CogIcon,
  GiftIcon,
  HomeIcon,
  NumberedListIcon,
  PlusCircleIcon,
  UserCircleIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/20/solid';
import type { User } from '@prisma/client';
import {
  Avatar,
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  Heading,
  Navbar,
  NavbarDivider,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarSection,
} from '@repo/ui';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { DaysUntilChristmasBadge } from './days-until-christmas-badge';
import GiftDialog from './gift-dialog';
import { Logo } from './logo';
import { LogoutDropDownItem } from './logout';

type NavItem = {
  label: string;
  url: string;
  icon: JSX.Element;
};

const isCurrentPath = (current: string, path: string) => current === path;

type NavProps = {
  user: User;
  users: User[];
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', url: '/home', icon: <HomeIcon height={20} /> },
  { label: 'People', url: '/people', icon: <UsersIcon height={20} /> },
  { label: 'Gifts', url: '/gifts', icon: <GiftIcon height={20} /> },
  { label: 'Claimed', url: '/claimed', icon: <NumberedListIcon height={20} /> },
  {
    label: 'Wishlists',
    url: '/wishlists',
    icon: <UserGroupIcon height={20} />,
  },
];

export function NavBar({ user, users }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const initials = user.name
    ? user.name[0].toUpperCase()
    : user.email?.[0].toUpperCase();

  // function that returns true if the current path matches the given path
  const currentPath = usePathname();

  return (
    <>
      <Navbar>
        <Logo />
        <NavbarDivider className="max-lg:hidden" />
        <NavbarSection className="max-lg:hidden">
          {NAV_ITEMS.map(({ label, url }) => {
            const current = isCurrentPath(currentPath, url);
            return (
              <NavbarItem key={label} href={url} current={current}>
                <NavbarLabel>{label}</NavbarLabel>
              </NavbarItem>
            );
          })}
        </NavbarSection>
        <NavbarSpacer />
        <NavbarSection>
          <NavbarSection className="max-lg:hidden">
            <DaysUntilChristmasBadge />
          </NavbarSection>

          <NavbarItem onClick={() => setIsOpen(true)}>
            <PlusCircleIcon />
            Add New Gift
          </NavbarItem>

          <Dropdown>
            <DropdownButton as={NavbarItem}>
              <Avatar
                src={user.image}
                initials={user.image ? undefined : initials}
                square
              />
            </DropdownButton>
            <DropdownMenu className="min-w-64" anchor="bottom end">
              <DropdownItem href="/user/me">
                <UserCircleIcon />
                <DropdownLabel>{user.name || user.email}</DropdownLabel>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => setIsOpen(true)}>
                <PlusCircleIcon />
                <DropdownLabel>Add new gift</DropdownLabel>
              </DropdownItem>
              <DropdownItem href="/user/settings">
                <CogIcon />
                <DropdownLabel>Settings</DropdownLabel>
              </DropdownItem>
              <DropdownDivider />
              <LogoutDropDownItem />
            </DropdownMenu>
          </Dropdown>
        </NavbarSection>
      </Navbar>
      <GiftDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        currentUser={user}
        users={users}
      />
    </>
  );
}

export function SidebarMarkup() {
  const currentPath = usePathname();
  const itemsMarkup = NAV_ITEMS.map(({ label, icon, url }) => {
    const current = isCurrentPath(currentPath, url);
    return (
      <SidebarItem href={url} current={current}>
        {label}
        {icon}
      </SidebarItem>
    );
  });
  return (
    <Sidebar>
      <SidebarHeader className="space-y-4">
        <div className="flex flex-row items-center justify-center gap-2">
          <Logo />
          <Heading>wishin.app</Heading>
        </div>
        <DaysUntilChristmasBadge />
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarHeading>Navigation</SidebarHeading>
          {itemsMarkup}
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  );
}
