'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import {
  CalendarIcon,
  ClockIcon,
  GiftIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/solid';
import { Heading, Strong, Text } from '@repo/ui';
import { Button } from '@repo/ui';
import { joinSecretSanta } from 'app/actions';
import { GiftTable } from 'components/gift-table';
import { Logo } from 'components/logo';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import type { GiftWithOwner, UserWithGifts } from 'types/prisma';
import { UserTable } from './UserTable';

interface HomePageTabsProps {
  gifts: GiftWithOwner[];
  userGifts: GiftWithOwner[];
  currentUserId: string;
  users: UserWithGifts[];
  secretSantaAssignments: {
    eventName: string;
    eventId: string;
    assignedTo: { name: string; email: string } | null;
    canJoin: boolean;
  }[];
}

export function HomePageTabs({
  gifts,
  userGifts,
  currentUserId,
  users,
  secretSantaAssignments,
}: HomePageTabsProps) {
  const router = useRouter();

  const handleJoinSecretSanta = async (eventId: string) => {
    const result = await joinSecretSanta(eventId);
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success(result.success);
      router.refresh();
    }
  };

  return (
    <TabGroup>
      <TabList className="grid grid-cols-4 gap-2 mb-6">
        {[
          {
            icon: ClockIcon,
            title: 'Latest Gifts',
            subtitle: "See what's new",
            color: 'green',
          },
          {
            icon: GiftIcon,
            title: 'Your Gifts',
            subtitle: 'Manage your wishlist',
            color: 'red',
          },
          {
            icon: UsersIcon,
            title: 'People',
            subtitle: 'View everyone in one place!',
            color: 'blue',
          },
          {
            icon: Logo,
            title: 'Secret Santa',
            subtitle: 'Your assignments',
            color: 'red',
          },
        ].map(({ icon: Icon, title, subtitle, color }, index) => (
          <Tab key={index} className="outline-none">
            {({ selected }) => (
              <div
                className={`w-full h-full flex flex-col items-center justify-center p-3 rounded-lg text-center text-base/6 font-medium transition-all duration-200 ease-in-out cursor-pointer ${
                  selected
                    ? `bg-${color}-100 text-${color}-800 shadow-md dark:bg-${color}-800 dark:text-${color}-100`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Icon
                  className={`h-6 w-6 mb-2 transition-transform duration-200 ease-in-out ${
                    selected
                      ? `text-${color}-500 dark:text-${color}-300`
                      : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'
                  }`}
                />
                <Strong className="text-sm transition-colors duration-200 ease-in-out group-hover:text-gray-900 dark:group-hover:text-gray-100">
                  {title}
                </Strong>
                <Text
                  className={`text-xs hidden sm:block transition-colors duration-200 ease-in-out ${
                    selected
                      ? `text-${color}-700 dark:text-${color}-200`
                      : 'text-gray-600 group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-gray-300'
                  }`}
                >
                  {subtitle}
                </Text>
              </div>
            )}
          </Tab>
        ))}
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
          <Heading className="text-2xl mb-4">People</Heading>
          <Text className="mb-4">
            View everyone in your wishlists and their gifts. You can view
            someone's profile by clicking on their name.
          </Text>
          <UserTable users={users} />
        </TabPanel>
        <TabPanel>
          <Heading className="text-2xl mb-4">Secret Santa Assignments</Heading>
          {secretSantaAssignments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {secretSantaAssignments.map((assignment, index) => (
                <div
                  key={index}
                  className="p-4 border border-blue-200 rounded-lg shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-blue-900 dark:to-gray-800 dark:border-blue-800 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center mb-3">
                    <CalendarIcon className="w-5 h-5 text-blue-500 mr-2" />
                    <Strong className="text-lg">{assignment.eventName}</Strong>
                  </div>
                  {assignment.assignedTo ? (
                    <div className="flex items-center">
                      <UserIcon className="w-5 h-5 text-red-500 mr-2" />
                      <Text>
                        You are Secret Santa for:
                        <Strong className="font-semibold ml-1">
                          {assignment.assignedTo.name ||
                            assignment.assignedTo.email}
                        </Strong>
                      </Text>
                    </div>
                  ) : assignment.canJoin ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center">
                        <GiftIcon className="w-5 h-5 text-yellow-500 mr-2" />
                        <Text className="text-yellow-700 dark:text-yellow-300 mr-2">
                          You're not participating in this event yet.
                        </Text>
                      </div>
                      <Button
                        onClick={() =>
                          handleJoinSecretSanta(assignment.eventId)
                        }
                        color="green"
                      >
                        Join
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <GiftIcon className="w-5 h-5 text-yellow-500 mr-2" />
                      <Text className="text-yellow-700 dark:text-yellow-300">
                        Assignments haven't been made yet!
                      </Text>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <Text className="text-gray-600 dark:text-gray-300">
                No Secret Santa events available at the moment.
              </Text>
            </div>
          )}
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
