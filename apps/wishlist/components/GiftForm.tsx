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
      className="flex flex-col p-4 space-y-4"
    >
      <div className="">
        <label className="text-sm font-medium text-gray-800">
          What&apos;s the name of the thing you wish for?
        </label>
        <input
          type="text"
          autoComplete="name"
          className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Red Mittens"
        />
      </div>

      <div className="">
        <label className="text-sm font-medium text-gray-800">
          Where can we find it? Remember that Amazon is also available in 🇨🇦
          (optional)
        </label>
        <input
          id="url"
          type="textbox"
          autoComplete="url"
          className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          placeholder="https://amazon.ca/ur-favourite-slippers"
          value={url}
          onChange={(e) => setURL(e.target.value)}
        />
      </div>

      <div className="">
        <label className="text-sm font-medium text-gray-800">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          autoComplete="notes"
          className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          placeholder="..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        className="px-4 py-3 bg-blue-600 text-white font-medium text-lg leading-snug rounded-lg hover:bg-blue-900 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-400 active:shadow-lg transition duration-300 ease-in-out w-full"
        data-mdb-ripple="true"
        data-mdb-ripple-color="light"
        type="submit"
      >
        {isNewGift ? `Add ${name} to your wishlist` : `Update ${name}`}
      </button>
    </form>
  );
  return newGiftForm;
};

export default GiftForm;
