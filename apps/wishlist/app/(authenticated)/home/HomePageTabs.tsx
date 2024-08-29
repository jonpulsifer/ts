'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { GiftIcon, UserIcon } from '@heroicons/react/24/outline';
import { Heading, Strong, Text } from '@repo/ui';
import { GiftTable } from 'components/gift-table';
import { GiftWithOwner } from 'types/prisma';

interface HomePageTabsProps {
  gifts: GiftWithOwner[];
  userGifts: GiftWithOwner[];
  currentUserId: string;
}

export function HomePageTabs({
  gifts,
  userGifts,
  currentUserId,
}: HomePageTabsProps) {
  return (
    <TabGroup>
      <TabList className="flex gap-4 mb-6">
        <Tab className="flex-1 sm:flex-none outline-none">
          {({ selected }) => (
            <button
              className={`w-full flex flex-col items-center gap-1 p-3 rounded-lg text-left text-base/6 font-medium transition-all duration-200 ease-in-out ${
                selected
                  ? 'bg-blue-100 text-blue-900 shadow-md dark:bg-blue-900 dark:text-blue-100'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <GiftIcon
                className={`h-5 w-5 ${selected ? 'text-blue-500 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'} shrink-0`}
              />
              <div className="text-center">
                <Strong className="block text-sm">Latest Gifts</Strong>
                <Text
                  className={`text-xs ${selected ? 'text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  See what&apos;s new
                </Text>
              </div>
            </button>
          )}
        </Tab>
        <Tab className="flex-1 sm:flex-none outline-none">
          {({ selected }) => (
            <button
              className={`w-full flex flex-col items-center gap-1 p-3 rounded-lg text-left text-base/6 font-medium transition-all duration-200 ease-in-out ${
                selected
                  ? 'bg-green-100 text-green-900 shadow-md dark:bg-green-900 dark:text-green-100'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <UserIcon
                className={`h-5 w-5 ${selected ? 'text-green-500 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'} shrink-0`}
              />
              <div className="text-center">
                <Strong className="block text-sm">Your Gifts</Strong>
                <Text
                  className={`text-xs ${selected ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  Manage your wishlist
                </Text>
              </div>
            </button>
          )}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Heading className="text-2xl mb-4">Latest Gifts</Heading>
          <Text className="mb-4">
            Discover the most recent additions to wishlists across your network.
            These are the latest 10 gifts that you can see from friends and
            family.
          </Text>
          <GiftTable
            gifts={gifts}
            currentUserId={currentUserId}
            showGiftOwner
          />
        </TabPanel>
        <TabPanel>
          <Heading className="text-2xl mb-4">Your Wishlist</Heading>
          <Text className="mb-4">
            Manage your personal wishlist here. Add, edit, or remove items as
            your desires change. Remember, sharing is caring!
          </Text>
          <GiftTable gifts={userGifts} currentUserId={currentUserId} />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
