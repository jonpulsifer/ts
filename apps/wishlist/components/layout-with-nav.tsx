'use client';
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
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronRight,
  CogIcon,
  GiftIcon,
  HomeIcon,
  LogOutIcon,
  PlusIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

type Props = {
  children: React.ReactNode;
};

export function Nav({ children }: Props) {
  return (
    <StackedLayout navbar={<NavBar />} sidebar={<SidebarMarkup />}>
      {children}
    </StackedLayout>
  );
}

function TeamDropdownMenu() {
  return (
    <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
      <DropdownItem href="/wishlists">
        <CogIcon size={16} />
        <DropdownLabel>Settings</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="/wishlists">
        <Avatar slot="icon" src="/santaicon.png" />
        <DropdownLabel>Christmas Wishlist</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="/wishlists">
        <Avatar
          slot="icon"
          initials="WC"
          className="bg-purple-500 text-white"
        />
        <DropdownLabel>Birthday Wishlist</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="/wishlists">
        <PlusIcon size={16} />
        <DropdownLabel>New wishlist&hellip;</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  );
}

const navItems = [
  { label: 'Home', url: '/', icon: <HomeIcon size={16} /> },
  { label: 'Claimed', url: '/claimed', icon: <GiftIcon size={16} /> },
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

export function NavBar() {
  return (
    <Navbar>
      <Dropdown>
        <DropdownButton as={NavbarItem} className="max-lg:hidden">
          <Avatar slot="icon" src="/santaicon.png" />
          <NavbarLabel>wishin.app</NavbarLabel>
          <ChevronDownIcon size={16} />
        </DropdownButton>
        <TeamDropdownMenu />
      </Dropdown>
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
            <Avatar src="/santaicon.png" square />
          </DropdownButton>
          <DropdownMenu className="min-w-64" anchor="bottom end">
            <DropdownItem href="/user/me">
              <UserIcon size={16} />
              <DropdownLabel>My profile</DropdownLabel>
            </DropdownItem>
            <DropdownItem href="/settings">
              <CogIcon size={16} />
              <DropdownLabel>Settings</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem
              onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
            >
              <LogOutIcon size={16} className="mr-2" />
              <DropdownLabel>Sign out</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarSection>
    </Navbar>
  );
}

export function SidebarMarkup() {
  const user = {
    name: 'Tailwind Labs',
    image: undefined,
  };
  const initials = 'TL';
  return (
    <Sidebar>
      <SidebarHeader>
        <Dropdown>
          <DropdownButton as={SidebarItem} className="lg:mb-2.5">
            <Avatar
              square
              src={user.image}
              initials={!user.image ? initials : undefined}
              className="size-10 sm:size-12 bg-zinc-200 dark:bg-zinc-950 dark:text-indigo-500"
            />{' '}
            <SidebarLabel>Tailwind Labs</SidebarLabel>
            <ChevronDownIcon />
          </DropdownButton>
          <TeamDropdownMenu />
        </Dropdown>
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
              <Avatar src="/santaicon.png" />
              <SidebarLabel>Bobby Tables</SidebarLabel>
              <ChevronRight size={16} />
            </SidebarItem>
          </Link>
        </SidebarSection>
      </SidebarFooter>
    </Sidebar>
  );
}
