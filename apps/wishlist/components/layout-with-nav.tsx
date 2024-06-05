import {
  Avatar,
  Badge,
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
  StackedLayout,
} from '@repo/ui';
import { isAuthenticated } from 'lib/prisma-ssr';
import {
  CalendarIcon,
  ChevronRight,
  CogIcon,
  HomeIcon,
  ListChecks,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import { User } from 'next-auth';

import { Logo } from './logo';
import { LogoutDropDownItem } from './logout';

type Props = {
  children: React.ReactNode;
};

export async function Nav({ children }: Props) {
  const session = await isAuthenticated();
  return (
    <StackedLayout
      navbar={<NavBar user={session.user} />}
      sidebar={<SidebarMarkup user={session.user} />}
    >
      {children}
    </StackedLayout>
  );
}

const navItems = [
  { label: 'Home', url: '/', icon: <HomeIcon size={16} /> },
  { label: 'Claimed', url: '/claimed', icon: <ListChecks size={16} /> },
  { label: 'People', url: '/people', icon: <UsersIcon size={16} /> },
  { label: 'Wishlists', url: '/wishlists', icon: <CalendarIcon size={16} /> },
];

const daysUntilChristmas = () => {
  const today = new Date();
  const christmas = new Date(today.getFullYear(), 11, 25);
  if (today.getMonth() === 11 && today.getDate() > 25) {
    christmas.setFullYear(christmas.getFullYear() + 1);
  }
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.ceil((christmas.getTime() - today.getTime()) / oneDay);
};

const DaysUntilChristmasBadge = () => {
  const count = daysUntilChristmas();
  const color =
    count >= 0 && count < 30
      ? 'red'
      : count > 30 && count < 90
        ? 'yellow'
        : count > 90 && count < 180
          ? 'green'
          : 'indigo';
  return (
    <Badge color={color} className="justify-center">
      🎅 {count} day{count > 1 || count === 0 ? 's' : ''} to Christmas
    </Badge>
  );
};

type NavProps = {
  user: User;
};

export async function NavBar({ user }: NavProps) {
  const initials = user.name
    ? user.name[0].toUpperCase()
    : user.email![0].toUpperCase();
  return (
    <Navbar>
      <Logo />
      <NavbarDivider className="max-lg:hidden" />
      <NavbarSection className="max-lg:hidden">
        {navItems.map(({ label, url }) => (
          <NavbarItem key={label} href={url}>
            <NavbarLabel>{label}</NavbarLabel>
          </NavbarItem>
        ))}
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
            <DropdownItem href="/user/me">
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

export function SidebarMarkup({ user }: NavProps) {
  const name = user.name || user.email;
  const initials = name ? name[0].toUpperCase() : user.email![0].toUpperCase();

  return (
    <Sidebar>
      <SidebarHeader>
        <DaysUntilChristmasBadge />
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarHeading>Navigation</SidebarHeading>
          {navItems.map(({ label, icon, url }) => (
            <SidebarItem key={label} href={url}>
              {icon}
              {label}
            </SidebarItem>
          ))}
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
