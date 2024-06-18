'use client';

import {
  Avatar,
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  Link,
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
  SidebarLabel,
  SidebarSection,
} from '@repo/ui';
import { ChevronRight, CogIcon, UserIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { User } from 'next-auth';

import { DaysUntilChristmasBadge } from './days-until-christmas-badge';
import { Logo } from './logo';
import { LogoutDropDownItem } from './logout';

type NavItem = {
  label: string;
  url: string;
  icon: JSX.Element;
};

const isCurrentPath = (current: string, path: string) => current === path;

export function NavBar({ user, items }: { user: User; items: NavItem[] }) {
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
      <NavbarSection className="max-lg:hidden">
        <DaysUntilChristmasBadge />
      </NavbarSection>
      <NavbarSection>
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
    </Navbar>
  );
}

export function SidebarMarkup({
  user,
  items,
}: {
  user: User;
  items: NavItem[];
}) {
  const name = user.name || user.email;
  const initials = name ? name[0].toUpperCase() : user.email![0].toUpperCase();
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
        <DaysUntilChristmasBadge />
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarHeading>Navigation</SidebarHeading>
          {itemsMarkup}
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarSection>
          <SidebarHeading>Your Profile</SidebarHeading>

          <Link href="/user/me">
            <SidebarItem>
              <Avatar
                src={user.image}
                initials={user.image ? undefined : initials}
              />
              <SidebarLabel>{name}</SidebarLabel>
              <ChevronRight size={16} />
            </SidebarItem>
          </Link>
        </SidebarSection>
      </SidebarFooter>
    </Sidebar>
  );
}
