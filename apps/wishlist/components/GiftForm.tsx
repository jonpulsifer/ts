'use client';

import { collection, doc, FirestoreError, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import type { Gift } from '../types';

import { useAuth } from './AuthProvider';

interface Props {
  gift?: Gift;
}

const GiftForm = ({ gift }: Props) => {
  const [name, setName] = useState(gift?.name || '');
  const [url, setURL] = useState(gift?.url || '');
  const [notes, setNotes] = useState(gift?.notes || '');
  const { user } = useAuth();
  const router = useRouter();
  const isNewGift = gift === undefined;

  if (!user) return null;
  const { uid } = user;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      toast.error('Missing gift name. Tell Santa what you want!', {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    const col = collection(db, 'gifts');
    const ref = isNewGift ? doc(col) : doc(col, gift.id);

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
        const msg = isNewGift
          ? `Added ${name} to your wishlist`
          : `${name} updated`;
        toast.success(msg, {
          position: toast.POSITION.TOP_CENTER,
        });
        if (isNewGift) {
          setName('');
          setURL('');
          setNotes('');
        } else {
          router.push('/mine');
        }
      })
      .catch((e) => {
        const error = e as FirestoreError;
        console.log(JSON.stringify(error));
        toast.error(error.code, {
          position: toast.POSITION.TOP_CENTER,
        });
      });
  }

  const newGiftForm = (
    <form
      onSubmit={(e) => handleSubmit(e)}
      className="flex flex-col p-4 space-y-4 text-left"
    >
      <div className="col-span-full">
        <label className="text-sm font-medium text-gray-800 dark:text-gray-400">
          What&apos;s the name of the thing you wish for?
        </label>
        <input
          type="text"
          autoComplete="name"
          className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Red Mittens"
        />
      </div>

      <div className="col-span-full">
        <label className="text-sm font-medium dark:text-gray-400 text-gray-800">
          Where can we find it? Remember that Amazon is also available in 🇨🇦
          (optional)
        </label>
        <input
          id="url"
          type="textbox"
          autoComplete="url"
          className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
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
          className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
          placeholder="..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
        <button
          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
          data-mdb-ripple="true"
          data-mdb-ripple-color="light"
          type="submit"
        >
          {isNewGift ? `Add ${name} to your wishlist` : `Update ${name}`}
        </button>
      </div>
    </form>
  );
  return newGiftForm;
};

export default GiftForm;
