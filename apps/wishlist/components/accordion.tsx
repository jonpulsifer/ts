'use client';
import { Disclosure, Transition } from '@headlessui/react-1';
import { Text } from '@repo/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Suspense } from 'react';

interface Props {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Accordion = ({ children, title, subtitle }: Props) => {
  return (
    <div className="divide-y dark:divide-slate-800 divide-gray-200 overflow-hidden xs:rounded-lg bg-white dark:bg-slate-900 dark:text-gray-400 shadow shadow-sm border-transparent">
      <Disclosure>
        {({ open }) => (
          <>
            <div className="px-2 pt-2 w-full">
              <Disclosure.Button>
                <div className="flex">
                  <div className="mr-2">
                    {open ? (
                      <ChevronDown width={16} />
                    ) : (
                      <ChevronRight width={16} />
                    )}
                  </div>
                  <div className="">
                    <h1 className="text-xl font-semibold leading-6 text-gray-900 dark:text-slate-200">
                      {title}
                    </h1>
                    <div>
                      <Text className="text-xs">{subtitle}</Text>
                    </div>
                  </div>
                </div>
              </Disclosure.Button>
            </div>
            <Transition
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-y-full"
              enterTo="translate-y-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-y-0"
              leaveTo="-translate-y-full"
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
                  <Disclosure.Panel className="text-gray-500">
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
