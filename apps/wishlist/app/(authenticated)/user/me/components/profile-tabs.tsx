'use client';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { Card, Text } from '@repo/ui';
import { GiftTable } from 'components/gift-table';
import { useState } from 'react';
import type { GiftWithOwner, UserWithGifts } from 'lib/db/types';

import UserForm from './user-form';

interface Props {
  user: UserWithGifts;
  gifts: GiftWithOwner[];
}

const ProfileTabs = ({ user, gifts }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const giftTabMarkup = (
    <div className="mt-4 sm:mt-8 space-y-4">
      <Text>Here is a list of all your gifts.</Text>
      <GiftTable gifts={gifts} currentUserId={user.id} />
    </div>
  );

  const tabs = [
    {
      name: 'My Gifts',
      content: giftTabMarkup,
      description: 'Gifts you own',
    },
    {
      name: 'Edit Details',
      content: <UserForm user={user} />,
      description: 'Edit your profile',
    },
  ];

  const tabClass =
    'px-4 py-2 dark:text-white ui-selected:font-bold font-semibold ui-selected:border-b-2 border-b border-gray-200 dark:border-zinc-800 dark:ui-selected:border-indigo-500 ui-selected:text-indigo-600 ui-selected:border-indigo-600 dark:hover:bg-zinc-950 hover:bg-zinc-950/[0.05]';
  return (
    <Card>
      <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <TabList className="grid grid-cols-2">
          {tabs.map((tab, index) => (
            <Tab key={`tab-${index}`} className={tabClass}>
              {tab.name}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((tab, index) => (
            <TabPanel key={`panel-${index}`}>{tab.content}</TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </Card>
  );
};

export default ProfileTabs;
