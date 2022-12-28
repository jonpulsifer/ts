'use client';

import { FirebaseError } from 'firebase/app';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { AppUser } from '../types';

import Card from './Card';
import { faUserCheck } from '@fortawesome/free-solid-svg-icons';

interface Props {
  user: AppUser;
}

const UserForm = ({ user }: Props) => {
  const [name, setName] = useState(user.name || '');
  const [address, setAddress] = useState(user.address || '');
  const [giftTheme, setGiftTheme] = useState(user.gift_theme || '');
  const [shirtSize, setShirtSize] = useState(user.shirt_size || '');
  const [pantSize, setPantSize] = useState(user.pant_size || '');
  const [shoeSize, setShoeSize] = useState(user.shoe_size || '');
  const router = useRouter();

  function submit(e: MouseEvent | FormEvent) {
    e.preventDefault();
    if (!name) {
      toast.error('Missing name', {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    setDoc(
      doc(collection(db, 'users'), user.uid),
      {
        name,
        address,
        gift_theme: giftTheme,
        pant_size: pantSize,
        shirt_size: shirtSize,
        shoe_size: shoeSize,
      },
      { merge: true },
    )
      .then(() => {
        toast.success('Profile Updated', {
          position: toast.POSITION.TOP_CENTER,
        });
        router.push(`/user/${user.uid}`);
      })
      .catch((error: FirebaseError) => {
        if (error.code === 'permission-denied') {
          toast.error('Permission Denied', {
            position: toast.POSITION.TOP_CENTER,
          });
          return;
        }
        console.log(JSON.stringify(error));
      });
  }

  return (
    <Card
      title="Let Santa know a little bit about you..."
      action={{
        title: 'Save Profile',
        icon: faUserCheck,
        fn: (e) => submit(e),
      }}
    >
      <form onSubmit={(e) => submit(e)} className="px-4 pb-4">
        <div className="mb-6">
          <label className="mb-2 text-sm font-medium text-gray-800">
            This is the name that you will have in the app
          </label>
          <input
            type="text"
            autoComplete="name"
            className="form-control block w-full px-4 py-2 text-lg font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rudolph"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 text-sm font-medium text-gray-800">
            Make it easy for grand-maman to send you a Christmas card by
            entering your address
          </label>
          <input
            id="address"
            autoComplete="street-address"
            className="form-control block w-full px-4 py-2 text-lg font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            placeholder="Stable #9, North Pole, H0H 0H0"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 text-sm font-medium text-gray-800">
            What are themes for Santa to keep in mind this year?
          </label>
          <input
            id="giftTheme"
            type="textbox"
            autoComplete="gift-theme"
            className="form-control block w-full px-4 py-2 text-lg font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            placeholder="Reindeer Games, Kitchen Stuff, Beer"
            value={giftTheme}
            onChange={(e) => setGiftTheme(e.target.value)}
          />
        </div>
        <div className="flex flex-row">
          <div className="mb-6 pr-2">
            <label className="mb-2 text-sm font-medium text-gray-800">
              Shirt Size
            </label>
            <input
              id="shirt"
              type="textbox"
              autoComplete="shirt-size"
              className="form-control block w-full px-4 py-2 text-lg font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              placeholder="S/M"
              value={shirtSize}
              onChange={(e) => setShirtSize(e.target.value)}
            />
          </div>
          <div className="mb-6 pr-2">
            <label className="mb-2 text-sm font-medium text-gray-800">
              Pant Size
            </label>
            <input
              id="pants"
              type="textbox"
              autoComplete="pant-size"
              className="form-control block w-full px-4 py-2 text-lg font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              placeholder="XL"
              value={pantSize}
              onChange={(e) => setPantSize(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 text-sm font-medium text-gray-800">
              Shoe Size
            </label>
            <input
              id="shoe"
              type="textbox"
              autoComplete="shoe-size"
              className="form-control block w-full px-4 py-2 text-lg font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              placeholder="13"
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
