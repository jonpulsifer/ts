'use client';

import { doc, setDoc, FirestoreError } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../lib/firebase';
import { AppUser, Family } from '../types';
import { useAuth } from './AuthProvider';
import Card from './Card';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshake, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import EmptyState from './EmptyState';

interface Props {
  families: Family[];
  user: AppUser;
}

type PinValues = {
  [K in string]: number;
};

const FamilyList = ({ families, user }: Props) => {
  const [pin, setPin] = useState<PinValues>({});
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPin((prev) => {
      prev[e.target.id] = Number(e.target.value);
      return prev;
    });
  };

  const handleJoin = async (
    e: React.FormEvent | React.MouseEvent,
    id: string,
  ) => {
    e.preventDefault();

    const family = families.find((f) => f.id === id);
    const pinMatch = family?.pin === pin[id];
    if (pinMatch) {
      const ref = doc(db, `/users/${currentUser?.uid}`);
      const localFamilies: string[] =
        user.families && user.families.length ? [...user.families] : [];

      if (!localFamilies.includes(family.id)) {
        localFamilies.push(family.id);
        setDoc(
          ref,
          {
            families: localFamilies,
          },
          { merge: true },
        )
          .then(() => {
            toast.success(`You've joined the ${family.name} family`);
            router.push('/people');
          })
          .catch((e) => {
            const error = e as FirestoreError;
            console.log(JSON.stringify(error));
            toast.error(error.message);
          });
      } else {
        toast.error(`You're already in the ${family.name} family`);
      }
    } else {
      toast.error(`Pin does not match for the ${family?.name} family`);
    }
  };

  const handleLeave = async (
    e: React.FormEvent | React.MouseEvent,
    id: string,
  ) => {
    e.preventDefault();

    const family = families.find((f) => f.id === id);
    if (!family) {
      console.log('could not get family');
      return;
    }
    const ref = doc(db, 'users', user.uid);
    const userFamilies: string[] =
      user.families && user.families.length ? [...user.families] : [];

    if (userFamilies.includes(family.id)) {
      const newFamilies = userFamilies.filter((f) => f != family.id);
      user.families = newFamilies;
      setDoc(ref, { families: newFamilies }, { merge: true })
        .then(() => {
          toast.success(`You've left the ${family.name} family`);
          router.push('/people');
        })
        .catch((e) => {
          const error = e as FirestoreError;
          console.log(JSON.stringify(error));
          toast.error(error.message);
        });
    } else {
      toast.error(`You're not in the ${family.name} family`);
    }
  };

  const familyList = (families: Family[]) => {
    return families.map((family) => {
      const { id, name } = family;
      const form = (
        <form className="flex flex-row items-center">
          <input
            id={family.id}
            type="number"
            pattern="\d{1,4}"
            inputMode="numeric"
            autoComplete="off"
            className="form-control block w-24 sm:w-48 px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 dark:border-dark-800 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
            value={pin[family.id]}
            onChange={(e) => handlePinChange(e)}
            placeholder="Pin"
          />
          <button
            className="inline-flex ml-4 w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 w-auto "
            data-mdb-ripple="true"
            data-mdb-ripple-color="light"
            type="submit"
            onClick={(e) => handleJoin(e, family.id)}
          >
            <div className="flex">
              <FontAwesomeIcon icon={faHandshake} className="pr-2" />
            </div>
            Join
          </button>
        </form>
      );

      const actionMarkup = user.families?.includes(family.id) ? (
        <button
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 w-auto"
          data-mdb-ripple="true"
          data-mdb-ripple-color="light"
          type="submit"
          onClick={(e) => handleLeave(e, family.id)}
        >
          <div className="flex items-center">
            <div className="flex">
              <FontAwesomeIcon icon={faTrashCan} className="pr-2" />
            </div>
            Leave
          </div>
        </button>
      ) : (
        form
      );

      return (
        <tr
          key={`${name}-${id}`}
          className={`border-t hover:bg-gray-100 dark:hover:bg-gray-950 transition dark:border-gray-800 ease-in-out duration-300`}
        >
          <td className="w-full py-2">
            <div className="flex items-center p-2 px-4">
              <div className="mr-4 sm:flex inline-flex overflow-hidden relative justify-center items-center w-10 h-10 rounded-full bg-indigo-100 dark:bg-gray-800">
                <span className="font-medium text-violet-600 dark:text-violet-500">
                  {name[0].toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-semibold text-xl">{name}</div>
              </div>
              <div className="flex flex-grow text-right justify-end">
                {actionMarkup}
              </div>
            </div>
          </td>
        </tr>
      );
    });
  };

  return families.length ? (
    <Card
      title="Family Wishlists"
      subtitle="Find your family and join their wishlist."
    >
      <div className="flex flex-row overflow-x-auto select-none">
        <table className="table-auto w-full rounded-lg">
          <tbody className="rounded rounded-xl">{familyList(families)}</tbody>
        </table>
      </div>
    </Card>
  ) : (
    <EmptyState
      title="👨‍👩‍👧‍👦 No Families Found"
      subtitle="Something is broken, talk to the webmaster"
    >
      <div className="p-4">The elves couldn&apos;t find any families.</div>
    </EmptyState>
  );
};

export default FamilyList;
