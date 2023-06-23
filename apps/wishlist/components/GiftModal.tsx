'use client';
import { faGifts } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, Transition } from '@headlessui/react';
import { collection, doc, FirestoreError, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Fragment, useRef } from 'react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import { db } from '../lib/firebase';
import { useAuth } from './AuthProvider';
interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Modal({ isOpen, setIsOpen }: Props) {
  const cancelButtonRef = useRef(null);
  const [name, setName] = useState('');
  const [url, setURL] = useState('');
  const [notes, setNotes] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;
  const { uid } = user;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      toast.error('Missing gift name. Tell Santa what you want!');
      return;
    }
    const col = collection(db, 'gifts');
    const ref = doc(col);

    setDoc(
      ref,
      {
        name,
        notes,
        url,
        owner: uid,
        claimed_by: '',
      },
      { merge: true },
    )
      .then(() => {
        const msg = `Added ${name} to your wishlist`;
        toast.success(msg);
        setName('');
        setURL('');
        setNotes('');
        router.refresh();
      })
      .catch((e) => {
        const error = e as FirestoreError;
        console.log(JSON.stringify(error));
        toast.error(error.code);
      });
  }
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-950 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-indigo-950">
                <form onSubmit={(e) => handleSubmit(e)}>
                  <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-slate-800 sm:mx-0 sm:h-10 sm:w-10">
                        <FontAwesomeIcon
                          className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                          aria-hidden="true"
                          icon={faGifts}
                        />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900 dark:text-slate-200"
                        >
                          Add a new gift!
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Use the form below to add a new gift to your
                            wishlist
                          </p>
                        </div>
                        <div className="mt-4 text-left space-y-4">
                          <div className="col-span-full">
                            <label className="text-sm font-medium text-gray-800 dark:text-gray-400">
                              Gift Name
                            </label>
                            <input
                              type="text"
                              autoComplete="name"
                              className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-slate-900 dark:focus:bg-slate-800 dark:placeholder-slate-700"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Red Mittens"
                            />
                          </div>
                          <div className="col-span-full">
                            <label className="text-sm font-medium dark:text-gray-400 text-gray-800">
                              <p>Link (optional)</p>
                              <p className="text-xs">
                                Remember that Amazon is also available in 🇨🇦
                              </p>
                            </label>
                            <input
                              id="url"
                              type="url"
                              inputMode="url"
                              autoComplete="url"
                              className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-slate-900 dark:focus:bg-slate-800 dark:placeholder-slate-700"
                              placeholder="https://amazon.ca/ur-favourite-slippers"
                              value={url}
                              onChange={(e) => setURL(e.target.value)}
                            />
                          </div>

                          <div className="col-span-full">
                            <label className="text-sm font-medium dark:text-gray-400 text-gray-800">
                              Notes (optional)
                            </label>
                            <textarea
                              id="notes"
                              autoComplete="notes"
                              className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-slate-900 dark:focus:bg-slate-800 dark:placeholder-slate-700"
                              placeholder="..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-950 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                      type="submit"
                    >
                      {`Add ${name} to your wishlist`}
                    </button>
                    <button
                      type="button"
                      className="mt-3 dark:text-slate-400 inline-flex w-full items-center justify-center rounded-md bg-white dark:bg-slate-900 px-3 py-2 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
