'use client';

import { faSave } from '@fortawesome/free-solid-svg-icons';
import { Gift } from '@prisma/client';
import { addGift, updateGift } from 'app/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Card } from 'ui';
interface Props {
  gift?: Gift;
}

const GiftForm = ({ gift }: Props) => {
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
    <>
      <Card
        title="Add a new gift"
        action={[
          {
            title: 'Update gift',
            icon: faSave,
            submit: 'upsertGift',
          },
          {
            title: 'Back',
            onClick: () => router.back(),
            secondary: true,
          },
        ]}
      >
        <form
          id="upsertGift"
          action={upsertGift}
          className="flex flex-col p-4 space-y-4 text-left"
        >
          <div className="col-span-full">
            <label className="text-sm font-medium text-gray-800 dark:text-gray-400">
              What&apos;s the name of the thing you wish for?
            </label>
            <input
              type="text"
              name="name"
              autoComplete="name"
              className="form-control block w-full px-4 py-2 font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
              defaultValue={gift?.name || ''}
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
              name="url"
              type="textbox"
              autoComplete="url"
              className="form-control block w-full px-4 py-2 font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
              placeholder="https://amazon.ca/ur-favourite-slippers"
              defaultValue={gift?.url || ''}
            />
          </div>

          <div className="col-span-full">
            <label className="text-sm font-medium dark:text-gray-400 text-gray-800">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              autoComplete="notes"
              name="description"
              className="form-control block w-full px-4 py-2 font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
              placeholder="..."
              defaultValue={gift?.description || ''}
            />
          </div>
        </form>
      </Card>
    </>
  );
};

export default GiftForm;
