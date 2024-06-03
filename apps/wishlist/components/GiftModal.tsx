'use client';

import { Dialog, Transition } from '@headlessui/react-1';
import { Button } from '@repo/ui';
import { addGift } from 'app/actions';
import { Gift } from 'lucide-react';
import { Fragment, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Modal({ isOpen, setIsOpen }: Props) {
  const cancelButtonRef = useRef(null);
  const formRef = useRef<HTMLFormElement>(null);

  const closeAndReset = () => {
    setIsOpen(false);
    formRef.current?.reset();
  };

  const handleAddGift = async (formData: FormData) => {
    const name = formData.get('name');
    const url = formData.get('url');
    const description = formData.get('description');
    if (!name) {
      toast.error('Please fill out a name');
      return;
    }

    const result = await addGift({
      name: name as string,
      url: url as string,
      description: description as string,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Added ${name} to your wishlist!`);
      formRef.current?.reset();
    }
  };

  function Submit() {
    const status = useFormStatus();
    return (
      <Button type="submit" color="indigo" disabled={status.pending}>
        {status.pending ? 'Adding...' : 'Add to wishlist'}
      </Button>
    );
  }

  return (
    <Transition.Root as={Fragment} show={isOpen}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={() => {
          closeAndReset();
        }}
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
          <div className="fixed inset-0 bg-black bg-opacity-75 dark:bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-left sm:text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 tranzinc-y-4 sm:tranzinc-y-0 sm:scale-95"
              enterTo="opacity-100 tranzinc-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 tranzinc-y-0 sm:scale-100"
              leaveTo="opacity-0 tranzinc-y-4 sm:tranzinc-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-zinc-900 text-left shadow-xl transition-all sm:my-8 w-full sm:w-full sm:max-w-lg border border-gray-50 dark:border-indigo-950">
                <form action={handleAddGift} ref={formRef}>
                  <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-zinc-800 sm:mx-0 sm:h-10 sm:w-10">
                        <div
                          aria-hidden="true"
                          className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                        >
                          <Gift />
                        </div>
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900 dark:text-zinc-200"
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
                              autoComplete="name"
                              className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-zinc-900 dark:focus:bg-zinc-800 dark:placeholder-zinc-700"
                              name="name"
                              placeholder="Red Mittens"
                              type="text"
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
                              autoComplete="url"
                              className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-zinc-900 dark:focus:bg-zinc-800 dark:placeholder-zinc-700"
                              inputMode="url"
                              name="url"
                              placeholder="https://amazon.ca/ur-favourite-slippers"
                              type="url"
                            />
                          </div>

                          <div className="col-span-full">
                            <label className="text-sm font-medium dark:text-gray-400 text-gray-800">
                              Notes (optional)
                            </label>
                            <textarea
                              autoComplete="description"
                              className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-zinc-900 dark:focus:bg-zinc-800 dark:placeholder-zinc-700"
                              name="description"
                              placeholder="..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-900 px-4 py-3 sm:px-6 flex flex-row-reverse gap-4">
                    <Submit />
                    <Button
                      plain
                      onClick={() => {
                        closeAndReset();
                      }}
                      ref={cancelButtonRef}
                      type="button"
                    >
                      Close
                    </Button>
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
