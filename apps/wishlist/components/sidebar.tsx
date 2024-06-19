'use client';

import { User } from '@prisma/client';
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
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarSection,
} from '@repo/ui';
import { CogIcon, PlusSquareIcon, UserIcon } from 'lucide-react';
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
  items: NavItem[];
};

export function NavBar({ user, users, items }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const initials = user.name
    ? user.name[0].toUpperCase()
    : user.email![0].toUpperCase();

  // function that returns true if the current path matches the given path
  const currentPath = usePathname();

  return (
    <Navbar>
      <Logo />
      <NavbarDivider className="max-lg:hidden" />
      <NavbarSection className="max-lg:hidden">
        {items.map(({ label, url }) => {
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

        <Dropdown>
          <DropdownButton as={NavbarItem}>
            <Avatar
              src={user.image}
              initials={user.image ? undefined : initials}
              square
            />
          </DropdownButton>
          <DropdownMenu className="min-w-64" anchor="bottom end">
            <DropdownItem>
              <UserIcon size={16} />
              <DropdownLabel>{user.email}</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={() => setIsOpen(true)}>
              <PlusSquareIcon size={16} />
              <DropdownLabel>Add new gift</DropdownLabel>
            </DropdownItem>
            <DropdownItem href="/user/me">
              <UserIcon size={16} />
              <DropdownLabel>My profile</DropdownLabel>
            </DropdownItem>
            <DropdownItem href="/user/settings">
              <CogIcon size={16} />
              <DropdownLabel>Settings</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <LogoutDropDownItem />
          </DropdownMenu>
        </Dropdown>
      </NavbarSection>
      <GiftDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        currentUser={user}
        users={users}
      />
    </Navbar>
  );
}

export function SidebarMarkup({ user, users, items }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentPath = usePathname();
  const itemsMarkup = items.map(({ label, icon, url }) => {
    const current = isCurrentPath(currentPath, url);
    return (
      <SidebarItem key={label} href={url} current={current}>
        {icon}
        {label}
      </SidebarItem>
    );
  });
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-row gap-2">
          <Logo />
          <Heading>wishin.app</Heading>
        </div>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarHeading>Navigation</SidebarHeading>
          {itemsMarkup}
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter className="space-y-2">
        <SidebarItem onClick={() => setIsOpen(true)}>
          <PlusSquareIcon size={16} />
          Add new gift
        </SidebarItem>
        <DaysUntilChristmasBadge />
      </SidebarFooter>
      <GiftDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        currentUser={user}
        users={users}
      />
    </Sidebar>
  );
}
