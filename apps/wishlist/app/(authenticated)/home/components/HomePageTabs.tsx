'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { GiftIcon, LightBulbIcon, UserIcon } from '@heroicons/react/24/outline';
import { Heading, Strong, Text } from '@repo/ui';
import { GiftTable } from 'components/gift-table';
import { motion } from 'framer-motion';
import { GiftWithOwner } from 'types/prisma';

import { GiftRecommendations } from './GiftRecommendations';

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
      <TabList className="grid grid-cols-3 gap-2 mb-6">
        <Tab className="outline-none">
          {({ selected }) => (
            <div
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
            </div>
          )}
        </Tab>
        <Tab className="outline-none">
          {({ selected }) => (
            <div
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
            </div>
          )}
        </Tab>
        <Tab className="outline-none">
          {({ selected }) => (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full flex flex-col items-center gap-1 p-3 rounded-lg text-left text-base/6 font-medium transition-all duration-200 ease-in-out ${
                selected
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <motion.div
                animate={{ rotate: selected ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <LightBulbIcon
                  className={`h-5 w-5 ${selected ? 'text-yellow-300' : 'text-gray-500 dark:text-gray-400'} shrink-0`}
                />
              </motion.div>
              <div className="text-center">
                <Strong className="block text-sm">Gift Ideas</Strong>
                <Text
                  className={`text-xs ${selected ? 'text-yellow-200' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  Discover recommendations
                </Text>
              </div>
            </motion.div>
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
        <TabPanel>
          <Heading className="text-2xl mb-4">Gift Recommendations</Heading>
          <Text className="mb-4">
            Explore personalized gift ideas based on your interests and
            preferences. These recommendations are tailored just for you!
          </Text>
          <GiftRecommendations />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
