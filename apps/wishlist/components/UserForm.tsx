'use client';

import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FirebaseError } from 'firebase/app';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card } from 'ui';

import { db } from '../lib/firebase';
import { AppUser } from '../types';

interface Props {
  user: AppUser;
}

const UserForm = ({ user }: Props) => {
  const [name, setName] = useState(user.name || '');
  const [address, setAddress] = useState(user.address || '');
  // const [giftTheme, setGiftTheme] = useState(user.gift_theme || '');
  const [shirtSize, setShirtSize] = useState(user.shirt_size || '');
  const [pantSize, setPantSize] = useState(user.pant_size || '');
  const [shoeSize, setShoeSize] = useState(user.shoe_size || '');
  const router = useRouter();

  function submit(e: MouseEvent | FormEvent) {
    e.preventDefault();
    if (!name) {
      toast.error('Please fill out a name');
      return;
    }
    setDoc(
      doc(collection(db, 'users'), user.uid),
      {
        name,
        address,
        // gift_theme: giftTheme,
        pant_size: pantSize,
        shirt_size: shirtSize,
        shoe_size: shoeSize,
      },
      { merge: true },
    )
      .then(() => {
        toast.success('Profile Updated');
        router.refresh();
      })
      .catch((error: FirebaseError) => {
        if (error.code === 'permission-denied') {
          toast.error('Permission Denied');
          return;
        }
        console.log(JSON.stringify(error));
      });
  }

  return (
    <Card
      title="Edit Profile"
      subtitle="Update your profile information"
      action={[
        {
          title: 'Save Profile',
          icon: faSave,
          onClick: (e) => submit(e),
        },
        {
          title: 'Back',
          onClick: () => router.back(),
          secondary: true,
        },
      ]}
    >
      <form onSubmit={(e) => submit(e)} className="px-4 pb-4">
        <div className="mb-6">
          <label className="mb-2 text-sm text-gray-800 dark:text-gray-400">
            Display Name
          </label>
          <input
            type="text"
            autoComplete="name"
            className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rudolph"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 text-sm text-gray-800 dark:text-gray-400">
            Address
          </label>
          <input
            id="address"
            autoComplete="street-address"
            className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
            placeholder="Stable #9, North Pole, H0H 0H0"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* <div className="mb-6">
          <label className="mb-2 text-sm text-gray-800 dark:text-gray-400">
            Gift Themes
          </label>
          <input
            id="giftTheme"
            type="textbox"
            autoComplete="gift-theme"
            className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
            placeholder="Reindeer Games, Kitchen Stuff, Beer"
            value={giftTheme}
            onChange={(e) => setGiftTheme(e.target.value)}
          />
        </div> */}
        <div className="flex flex-row">
          <div className="mb-6 pr-2">
            <label className="mb-2 text-sm text-gray-800 dark:text-gray-400">
              Shirt Size
            </label>
            <input
              id="shirt"
              type="textbox"
              autoComplete="shirt-size"
              className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
              placeholder="S/M"
              value={shirtSize}
              onChange={(e) => setShirtSize(e.target.value)}
            />
          </div>
          <div className="mb-6 pr-2">
            <label className="mb-2 text-sm text-gray-800 dark:text-gray-400">
              Pant Size
            </label>
            <input
              id="pants"
              type="textbox"
              autoComplete="pant-size"
              className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
              placeholder="XL"
              value={pantSize}
              onChange={(e) => setPantSize(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 text-sm text-gray-800 dark:text-gray-400">
              Shoe Size
            </label>
            <input
              id="shoe"
              type="textbox"
              autoComplete="shoe-size"
              className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
              placeholder="7.5"
              inputMode="decimal"
              value={shoeSize}
              onChange={(e) => setShoeSize(e.target.value)}
            />
          </div>
        </div>
      </form>
    </Card>
  );
};

export default UserForm;
