'use client';
import { Disclosure, Transition } from '@headlessui/react-1';
import { Text } from '@repo/ui';
import { ChevronDownCircle, ChevronUpCircle } from 'lucide-react';
import { useState } from 'react';

interface Props {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Accordion = ({ children, title, subtitle }: Props) => {
  const [open, setOpen] = useState(false);
  const openCloseButton = open ? (
    <>
      <Text className="text-xs">Collapse</Text>
      <ChevronUpCircle />
    </>
  ) : (
    <>
      <Text className="text-xs">Open</Text>
      <ChevronDownCircle />
    </>
  );

  return (
    <div className="divide-y dark:divide-slate-800 divide-gray-200 overflow-hidden xs:rounded-lg bg-white dark:bg-slate-900 dark:text-gray-400 shadow shadow-md border-transparent">
      <Disclosure>
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-row">
            <div className="flex flex-col grow xs:gap-2">
              <h1 className="text-xl font-semibold leading-6 text-gray-900 dark:text-slate-200">
                {title}
              </h1>
              <div>
                <Text className="text-xs">{subtitle}</Text>
              </div>
            </div>
            <div className="flex">
              <Disclosure.Button className="" onClick={() => setOpen(!open)}>
                <div className="flex gap-2">{openCloseButton}</div>
              </Disclosure.Button>
            </div>
          </div>
        </div>
        <Transition
          show={open}
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
        </Transition>
      </Disclosure>
    </div>
  );
};
