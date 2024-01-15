'use client';

import { faSave } from '@fortawesome/free-solid-svg-icons';
import type { User } from '@prisma/client';
import { Card } from '@repo/ui/card';
import { editUser } from 'app/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Props {
  user: User;
}

function UserForm({ user }: Props) {
  const router = useRouter();

  const clientEditUser = async (formData: FormData) => {
    const name = formData.get('name');
    const address = formData.get('address');
    const shirtSize = formData.get('shirt_size');
    const pantSize = formData.get('pant_size');
    const shoeSize = formData.get('shoe_size');
    if (!name) {
      toast.error('Please fill out a name');
      return;
    }
    const result = await editUser({
      id: user.id,
      name: name as string,
      address: address as string,
      shirt_size: shirtSize as string,
      pant_size: pantSize as string,
      shoe_size: shoeSize as string,
    });
    if (result.error) {
      toast.error(result.error);
      toast.error('Something went wrong. Please try again.');
    } else {
      toast.success(`Updated ${name}!`);
    }
  };

  return (
    <Card
      action={[
        {
          title: 'Save Profile',
          icon: faSave,
          submit: 'editUser',
        },
        {
          title: 'Back',
          onClick: () => {
            router.back();
          },
          secondary: true,
        },
      ]}
      subtitle="Update your profile information"
      title="Edit Profile"
    >
      <form action={clientEditUser} className="px-4 pb-4" id="editUser">
        <button className="hidden" formAction={clientEditUser} />
        <div className="mb-6">
          <label className="mb-2 text-sm text-gray-800 dark:text-gray-400">
            Display Name
          </label>
          <input
            autoComplete="name"
            className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
            defaultValue={user.name || ''}
            name="name"
            placeholder="Rudolph"
            type="text"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 text-sm text-gray-800 dark:text-gray-400">
            Address
          </label>
          <input
            autoComplete="street-address"
            className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
            defaultValue={user.address || ''}
            id="address"
            name="address"
            placeholder="Stable #9, North Pole, H0H 0H0"
          />
        </div>

        <div className="flex flex-row">
          <div className="mb-6 pr-2">
            <label className="mb-2 text-sm text-gray-800 dark:text-gray-400">
              Shirt Size
            </label>
            <input
              autoComplete="shirt-size"
              className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
              defaultValue={user.shirt_size || ''}
              id="shirt"
              name="shirt_size"
              placeholder="S/M"
              type="textbox"
            />
          </div>
          <div className="mb-6 pr-2">
            <label className="mb-2 text-sm text-gray-800 dark:text-gray-400">
              Pant Size
            </label>
            <input
              autoComplete="pant-size"
              className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
              defaultValue={user.pant_size || ''}
              id="pants"
              name="pant_size"
              placeholder="XL"
              type="textbox"
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 text-sm text-gray-800 dark:text-gray-400">
              Shoe Size
            </label>
            <input
              autoComplete="shoe-size"
              className="form-control block w-full px-4 py-2 text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-gray-900 dark:focus:bg-gray-800 dark:placeholder-gray-700"
              defaultValue={user.shoe_size || ''}
              id="shoe"
              inputMode="decimal"
              name="shoe_size"
              placeholder="7.5"
              type="textbox"
            />
          </div>
        </div>
      </form>
    </Card>
  );
}

export default UserForm;
