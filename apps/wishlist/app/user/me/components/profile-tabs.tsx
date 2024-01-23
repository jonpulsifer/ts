'use client';
import { Tab } from '@headlessui/react-1';
import { Card } from '@repo/ui';
import { GiftTable } from 'components/gift-table';
import UserForm from 'components/UserForm';
import { useState } from 'react';
import { GiftWithOwner, UserWithGifts } from 'types/prisma';

interface Props {
  user: UserWithGifts;
  gifts: GiftWithOwner[];
}

const ProfileTabs = ({ user, gifts }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const tabs = [
    {
      name: 'Gifts',
      content: <GiftTable gifts={gifts} currentUserId={user.id} />,
      description: 'Gifts you own',
    },
    {
      name: 'Details',
      content: <UserForm user={user} />,
      description: 'Edit your profile',
    },
  ];

  const tabClass =
    'px-4 py-2 dark:text-white font-semibold border-b border-gray-200 dark:border-slate-800 dark:ui-selected:border-indigo-500 hover:bg-slate-950/[0.12]';
  return (
    <Card>
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="grid grid-cols-2">
          {tabs.map((tab, index) => (
            <Tab key={`tab-${index}`} className={tabClass}>
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          {tabs.map((tab, index) => (
            <Tab.Panel key={`panel-${index}`}>{tab.content}</Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </Card>
  );
};

export default ProfileTabs;
