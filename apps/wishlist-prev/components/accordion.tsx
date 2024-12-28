'use client';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { Avatar, type AvatarProps } from '@repo/ui';
import type React from 'react';
import { Suspense } from 'react';

interface Props {
  title?: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  button?: React.ReactNode;
  avatar?: AvatarProps;
}

export const Accordion = ({
  children,
  title,
  subtitle,
  isOpen,
  button,
  avatar,
}: Props) => {
  const avatarMarkup = avatar ? (
    <div className="">
      <Avatar
        square
        src={avatar.src}
        initials={avatar.initials}
        className="size-12 bg-zinc-200/80 dark:bg-zinc-950 dark:text-indigo-500"
      />
    </div>
  ) : null;

  return (
    <div className="divide-y dark:divide-zinc-800 divide-zinc-200 overflow-hidden xs:rounded-lg bg-white dark:bg-zinc-900 dark:text-zinc-400 shadow shadow-sm border-transparent">
      <Disclosure defaultOpen={isOpen}>
        {({ open }) => (
          <>
            <div className="p-2 w-full flex justify-between">
              <DisclosureButton>
                <div className="flex gap-2">
                  <>
                    {open ? (
                      <ChevronDownIcon
                        width={20}
                        className="hover:animate-pulse hover:text-indigo-600 -mr-1"
                      />
                    ) : (
                      <ChevronRightIcon
                        width={20}
                        className="hover:animate-pulse hover:text-indigo-600 -mr-1"
                      />
                    )}
                  </>
                  {avatarMarkup}
                  <div className="text-left">
                    <h1 className="text-xl font-semibold leading-6 text-zinc-900 dark:text-zinc-200">
                      {title}
                    </h1>
                    <div>{subtitle}</div>
                  </div>
                </div>
              </DisclosureButton>
              <div className="flex-shrink-0">{button}</div>
            </div>
            <Transition
              enter="ease-out duration-300"
              enterFrom="opacity-0 tranzinc-y-4 sm:tranzinc-y-0 sm:scale-95"
              enterTo="opacity-100 tranzinc-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 tranzinc-y-0 sm:scale-100"
              leaveTo="opacity-0 tranzinc-y-4 sm:tranzinc-y-0 sm:scale-95"
            >
              <Suspense>
                <TransitionChild
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <DisclosurePanel className="text-zinc-500">
                    <div className="px-2">{children}</div>
                  </DisclosurePanel>
                </TransitionChild>
              </Suspense>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
};
