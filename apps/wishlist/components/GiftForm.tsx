'use client';

import { faSave } from '@fortawesome/free-solid-svg-icons';
import { Gift } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card } from 'ui';
interface Props {
  gift?: Gift;
}

const GiftForm = ({ gift }: Props) => {
  const [name, setName] = useState(gift?.name || '');
  const [url, setURL] = useState(gift?.url || '');
  const [description, setDescription] = useState(gift?.description || '');
  const router = useRouter();

  function submit(e: MouseEvent | FormEvent) {
    e.preventDefault();
    if (!name) {
      toast.error('Missing gift name. Tell Santa what you want!');
      return;
    }
    if (!gift) {
      fetch('/api/gift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, url, description }),
      })
        .then((res) => {
          if (res.ok) {
            toast.success(`Added ${name} to your wishlist!`);
            router.push('/gifts');
          } else {
            toast.error('Something went wrong. Please try again.');
          }
        })
        .catch(() => {
          toast.error('Something went wrong. Please try again.');
        });
    } else {
      fetch('/api/gift', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: gift.id, name, url, description }),
      })
        .then((res) => {
          if (res.ok) {
            toast.success(`Updated ${name}!`);
            router.refresh();
          } else {
            toast.error('Something went wrong. Please try again.');
          }
        })
        .catch(() => {
          toast.error('Something went wrong. Please try again.');
        });
    }
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>
    </Card>
  );
};

export default GiftForm;
