'use client';
import { Disclosure, Transition } from '@headlessui/react-1';
import { Avatar, AvatarProps } from '@repo/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { Suspense } from 'react';

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
        className="size-10 sm:size-12 bg-zinc-200/80 dark:bg-slate-950 dark:text-indigo-500"
      />
    </div>
  ) : null;

  return (
    <div className="divide-y dark:divide-slate-800 divide-zinc-200 overflow-hidden xs:rounded-lg bg-white dark:bg-slate-900 dark:text-zinc-400 shadow shadow-sm border-transparent">
      <Disclosure defaultOpen={isOpen}>
        {({ open }) => (
          <>
            <div className="p-2 sm:p-4 w-full flex justify-between">
              <Disclosure.Button>
                <div className="flex space-x-2">
                  <div className="">
                    {open ? (
                      <ChevronDown width={16} />
                    ) : (
                      <ChevronRight width={16} />
                    )}
                  </div>
                  {avatarMarkup}
                  <div className="text-left">
                    <h1 className="text-xl font-semibold leading-6 text-zinc-900 dark:text-slate-200">
                      {title}
                    </h1>
                    <div>{subtitle}</div>
                  </div>
                </div>
              </Disclosure.Button>
              <div className="flex-shrink-0">{button}</div>
            </div>
            <Transition
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Suspense>
                <Transition.Child
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Disclosure.Panel className="text-zinc-500">
                    <div className="p-2 sm:p-4">{children}</div>
                  </Disclosure.Panel>
                </Transition.Child>
              </Suspense>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
};
