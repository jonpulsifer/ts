import { Button, Divider, Heading } from '@repo/ui';
import { GiftTable } from 'components/gift-table';
import { getGiftsWithOwnerByUserId, getMe } from 'lib/prisma-ssr';
import { Cog } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'View your profile',
};

const MePage = async () => {
  console.log('MePage');
  const user = await getMe();
  const gifts = await getGiftsWithOwnerByUserId(user.id);
  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between">
        <Heading>My Profile</Heading>
        <div className="flex gap-4">
          <Button outline href={'/user/settings'}>
            <Cog size={16} />
            Settings
          </Button>
        </div>
      </div>
      <Divider soft className="my-4" />
      <GiftTable gifts={gifts} currentUserId={user.id} />
    </>
  );
};

export default MePage;
