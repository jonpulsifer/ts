'use client';
import { DropdownItem, DropdownLabel } from '@repo/ui/dropdown';
import { LogOutIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function LogoutDropDownItem() {
  return (
    <DropdownItem
      onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
    >
      <LogOutIcon size={16} className="mr-2" />
      <DropdownLabel>Sign out</DropdownLabel>
    </DropdownItem>
  );
}
