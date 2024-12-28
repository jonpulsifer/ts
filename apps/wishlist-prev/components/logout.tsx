'use client';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/16/solid';
import { DropdownItem, DropdownLabel } from '@repo/ui/dropdown';
import { signOut } from 'next-auth/react';

export function LogoutDropDownItem() {
  return (
    <DropdownItem
      onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
    >
      <ArrowRightStartOnRectangleIcon />
      <DropdownLabel>Sign out</DropdownLabel>
    </DropdownItem>
  );
}
