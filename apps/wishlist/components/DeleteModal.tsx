'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import type { Gift } from '@prisma/client';
import { Trash } from 'lucide-react';
import { Fragment, useRef } from 'react';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  gift: Gift | null;
  action: (formData: FormData) => void;
}

export default function Modal({ isOpen, setIsOpen, gift, action }: Props) {
  const cancelButtonRef = useRef(null);
  if (!gift) return;
  return (
    <Transition as={Fragment} show={isOpen}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-left sm:text-center sm:items-center sm:p-0">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 tranzinc-y-4 sm:tranzinc-y-0 sm:scale-95"
              enterTo="opacity-100 tranzinc-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 tranzinc-y-0 sm:scale-100"
              leaveTo="opacity-0 tranzinc-y-4 sm:tranzinc-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-zinc-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form action={action}>
                  <input name="id" type="hidden" value={gift.id} />

                  <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-zinc-800 sm:mx-0 sm:h-10 sm:w-10">
                        <Trash />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <DialogTitle
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900 dark:text-zinc-200"
                        >
                          Delete {gift.name}?
                        </DialogTitle>
                        <div className="mt-2 text-gray-500">
                          <p>
                            Are you sure you want to{' '}
                            <span className="font-bold text-black dark:text-white">
                              delete {gift.name}?
                            </span>
                          </p>
                          <p>This can not be undone.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      className="bg-red-600 hover:bg-red-500 dark:hover:bg-red-900 inline-flex w-full justify-center rounded-md px-3 py-2 font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
                      type="submit"
                    >
                      Delete
                    </button>
                    <button
                      className="font-semibold text-gray-900 mt-3 dark:text-zinc-400 inline-flex w-full justify-center rounded-md bg-white dark:bg-zinc-900 px-3 py-2 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => {
                        setIsOpen(false);
                      }}
                      ref={cancelButtonRef}
                      type="button"
                    >
                      Close
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
