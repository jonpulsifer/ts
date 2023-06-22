'use client';

import { collection, doc, FirestoreError, setDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { useRouter } from 'next/navigation';
import React, { useState, FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import type { Gift } from '../types';
import Card from './Card';

import { useAuth } from './AuthProvider';
import { faSave } from '@fortawesome/free-solid-svg-icons';

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

  function submit(e: MouseEvent | FormEvent) {
    e.preventDefault();
    if (!name) {
      toast.error('Missing gift name. Tell Santa what you want!');
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
        toast.success(msg);
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
        toast.error(error.code);
      });
  }

  return (
    <Card
      title="Add a new gift"
      subtitle="Tell Santa what you want"
      action={{
        title: `Update ${name}`,
        icon: faSave,
        onClick: (e) => submit(e),
      }}
    >
      <form
        onSubmit={(e) => submit(e)}
        className="flex flex-col p-4 space-y-4 text-left"
      >
        <div className="col-span-full">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-400">
            What&apos;s the name of the thing you wish for?
          </label>
          <input
            type="text"
            autoComplete="name"
            className="form-control block w-full px-4 py-2 font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
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
            className="form-control block w-full px-4 py-2 font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
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
            className="form-control block w-full px-4 py-2 font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
            placeholder="..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Card>
  );
};

export default GiftForm;
