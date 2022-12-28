'use client';

import { doc, setDoc, FirestoreError } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { db } from '../lib/firebase';
import { AppUser, Family } from '../types';
import { useAuth } from './AuthProvider';
import Card from './Card';
import Loading from './Loading';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshake, faTrashCan } from '@fortawesome/free-solid-svg-icons';

interface Props {
  families: Family[];
  user: AppUser;
}

type PinValues = {
  [K in string]: number;
};

const FamilyList = ({ families, user }: Props) => {
  const [pin, setPin] = useState<PinValues>({});
  const { user: currentUser, loading } = useAuth();
  const router = useRouter();

  if (!currentUser || loading) return <Loading />;

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
      const ref = doc(db, `/users/${currentUser.uid}`);
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
            toast.success(`You've joined the ${family.name} family`, {
              position: toast.POSITION.TOP_CENTER,
            });
            router.push('/people');
          })
          .catch((e) => {
            const error = e as FirestoreError;
            console.log(JSON.stringify(error));
            toast.error(error.message, {
              position: toast.POSITION.TOP_CENTER,
            });
          });
      } else {
        toast.error(`You're already in the ${family.name} family`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } else {
      toast.error(`Pin does not match for the ${family?.name} family`, {
        position: toast.POSITION.TOP_CENTER,
      });
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
          toast.success(`You've left the ${family.name} family`, {
            position: toast.POSITION.TOP_CENTER,
          });
          router.push('/people');
        })
        .catch((e) => {
          const error = e as FirestoreError;
          console.log(JSON.stringify(error));
          toast.error(error.message, {
            position: toast.POSITION.TOP_CENTER,
          });
        });
    } else {
      toast.error(`You're not in the ${family.name} family`, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const familyList = (families: Family[]) => {
    return families.map((family, idx, { length }) => {
      const { id, name } = family;
      const isLast = length - 1 === idx;
      const form = (
        <form>
          <div className="flex flex-row space-x-4">
            <input
              id={family.id}
              type="number"
              pattern="\d{1,4}"
              autoComplete="off"
              className="form-control block w-20 sm:w-48 px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              value={pin[family.id]}
              onChange={(e) => handlePinChange(e)}
              placeholder="Pin"
            />
            <button
              className="px-4 py-2 flex flex-row items-center bg-blue-600 text-white font-medium text-lg leading-snug rounded-lg hover:bg-blue-900 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-400 active:shadow-lg transition duration-300 ease-in-out"
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
          </div>
        </form>
      );

      const actionMarkup = user.families?.includes(family.id) ? (
        <>
          <button
            className="px-4 py-2 flex flex-row items-center bg-red-600 text-white font-medium text-lg leading-snug rounded-lg hover:bg-red-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-700 active:shadow-lg transition duration-300 ease-in-out"
            data-mdb-ripple="true"
            data-mdb-ripple-color="light"
            type="submit"
            onClick={(e) => handleLeave(e, family.id)}
          >
            <div className="flex">
              <FontAwesomeIcon icon={faTrashCan} className="pr-2" />
            </div>
            Leave
          </button>
        </>
      ) : (
        form
      );

      return (
        <tr
          key={`${name}-${id}`}
          className={`border-t hover:bg-gray-50 transition ease-in-out duration-300`}
        >
          <td className={`w-full py-2 ${isLast ? 'rounded-b-lg' : ''}`}>
            <div className="flex items-center p-2 px-4">
              <div className="hidden mr-4 sm:flex inline-flex overflow-hidden relative justify-center items-center w-10 h-10 rounded-full bg-indigo-100">
                <span className="font-medium text-violet-600">
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
    <Card>
      <div className="flex flex-row overflow-x-auto select-none">
        <table className="table-auto w-full rounded-lg">
          <thead className="">
            <tr className="">
              <th className="px-4 py-4 text-left">Family</th>
            </tr>
          </thead>
          <tbody className="rounded rounded-xl">{familyList(families)}</tbody>
        </table>
      </div>
    </Card>
  ) : (
    <Card title="👨‍👩‍👧‍👦 No Families Found">
      <div className="p-4">
        The elves couldn&apos;t find any families. Something is broken!
      </div>
    </Card>
  );
};

export default FamilyList;
