'use client';

import { Transition } from '@headlessui/react';
import { DoorClosed, Lightbulb } from 'lucide-react';
import React from 'react';
import { resolveValue, toast, Toaster, ToastIcon } from 'react-hot-toast';

export function Toast() {
  return (
    <Toaster position="top-center" toastOptions={{ duration: 2000 }}>
      {(t) => (
        <Transition
          appear
          enter="transition-all duration-150"
          enterFrom="opacity-0 scale-50"
          enterTo="opacity-100 scale-100"
          leave="transition-all duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-75"
          show={t.visible}
        >
          <div
            className="flex transform p-4 rounded shadow-lg bg-white font-bold dark:bg-zinc-900 dark:text-zinc-200"
            onClick={() => {
              toast.dismiss(t.id);
            }}
          >
            <ToastIcon toast={t} />
            <p className="px-2">{resolveValue(t.message, t)}</p>
          </div>
        </Transition>
      )}
    </Toaster>
  );
}

export const dismissable = (content: string | JSX.Element) => {
  toast((t) => {
    t.duration = Infinity;
    t.icon = <Lightbulb />;
    return (
      <div
        className="flex items-center"
        onClick={() => {
          toast.dismiss(t.id);
        }}
      >
        <button
          className="fixed top-1 right-2 text-zinc-200 hover:text-zinc-600 dark:hover:text-indigo-400 dark:text-indigo-600 pl-4"
          onClick={() => {
            toast.dismiss(t.id);
          }}
        >
          <DoorClosed />
        </button>
        <p className="font-bold">{content}</p>
      </div>
    );
  });
};

export default Toast;
