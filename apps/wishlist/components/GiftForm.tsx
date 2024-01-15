'use client';

import { faSave } from '@fortawesome/free-solid-svg-icons';
import type { Gift } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Card } from '@repo/ui/card';
import { addGift, updateGift } from 'app/actions';

interface Props {
  gift?: Gift;
}

function GiftForm({ gift }: Props) {
  const router = useRouter();
  const upsertGift = async (formData: FormData) => {
    const name = formData.get('name');
    const url = formData.get('url');
    const description = formData.get('description');
    if (!name) {
      toast.error('Please fill out a name');
      return;
    }

    const operation = gift
      ? updateGift({
          id: gift.id,
          name: name as string,
          url: url as string,
          description: description as string,
        })
      : addGift({
          name: name as string,
          url: url as string,
          description: description as string,
        });

    const result = await operation;
    if (result?.error) {
      toast.error(result.error);
    } else {
      gift
        ? toast.success(`Updated ${name}!`)
        : toast.success(`Added ${name} to your wishlist!`);
    }
  };

  return (
    <Card
        action={[
          {
            title: 'Update gift',
            icon: faSave,
            submit: 'upsertGift',
          },
          {
            title: 'Back',
            onClick: () => { router.back(); },
            secondary: true,
          },
        ]}
        title="Add a new gift"
      >
        <form
          action={upsertGift}
          className="flex flex-col p-4 space-y-4 text-left"
          id="upsertGift"
        >
          <div className="col-span-full">
            <label className="text-sm font-medium text-gray-800 dark:text-gray-400">
              What&apos;s the name of the thing you wish for?
            </label>
            <input
              autoComplete="name"
              className="form-control block w-full px-4 py-2 font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
              defaultValue={gift?.name || ''}
              name="name"
              placeholder="Red Mittens"
              type="text"
            />
          </div>

          <div className="col-span-full">
            <label className="text-sm font-medium dark:text-gray-400 text-gray-800">
              Where can we find it? Remember that Amazon is also available in 🇨🇦
              (optional)
            </label>
            <input
              autoComplete="url"
              className="form-control block w-full px-4 py-2 font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
              defaultValue={gift?.url || ''}
              id="url"
              name="url"
              placeholder="https://amazon.ca/ur-favourite-slippers"
              type="textbox"
            />
          </div>

          <div className="col-span-full">
            <label className="text-sm font-medium dark:text-gray-400 text-gray-800">
              Notes (optional)
            </label>
            <textarea
              autoComplete="notes"
              className="form-control block w-full px-4 py-2 font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
              defaultValue={gift?.description || ''}
              id="notes"
              name="description"
              placeholder="..."
            />
          </div>
        </form>
      </Card>
  );
}

export default GiftForm;
