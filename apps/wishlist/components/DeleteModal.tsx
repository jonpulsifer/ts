'use client';
import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { Gift } from 'types';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  gift: Gift | null;
  onClick: () => void;
}

export default function Modal({ isOpen, setIsOpen, gift, onClick }: Props) {
  const cancelButtonRef = useRef(null);
  if (!gift) return;
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-left sm:text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={() => onClick()}>
                  <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-slate-800 sm:mx-0 sm:h-10 sm:w-10">
                        <FontAwesomeIcon
                          className="h-6 w-6 text-red-600 dark:text-red-800"
                          aria-hidden="true"
                          icon={faTrashCan}
                        />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900 dark:text-slate-200"
                        >
                          Delete {gift.name}?
                        </Dialog.Title>
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
                  <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 font-semibold text-white shadow-sm hover:bg-red-500 dark:hover:bg-red-900 sm:ml-3 sm:w-auto"
                      type="submit"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="font-semibold text-gray-900 mt-3 dark:text-slate-400 inline-flex w-full justify-center rounded-md bg-white dark:bg-slate-900 px-3 py-2 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setIsOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Close
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
