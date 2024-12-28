'use client';

import type { User } from '@prisma/client';
import { Button } from '@repo/ui/button';
import { Field, FieldGroup, Fieldset, Label } from '@repo/ui/fieldset';
import { Input } from '@repo/ui/input';
import { updateUser } from 'app/actions';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import toast from 'react-hot-toast';

interface Props {
  user: User;
}

function UserForm({ user }: Props) {
  const router = useRouter();
  const { pending } = useFormStatus();
  const [state, formAction] = useFormState(updateUser, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state?.error);
    }
    if (state?.success) {
      toast.success('User updated');
    }
  }, [state]);

  return (
    <form action={formAction} id="editUser">
      <div className="border-b dark:border-gray-200/10 border-gray-900/10 pb-12 p-4">
        <Fieldset>
          <FieldGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <Field className="col-span-2">
                <Label>Email</Label>
                <Input
                  autoComplete="email"
                  defaultValue={user.email}
                  name="email"
                  disabled
                  type="text"
                />
              </Field>
              <Field className="col-span-2">
                <Label>Name</Label>
                <Input
                  autoComplete="name"
                  name="name"
                  defaultValue={user.name || ''}
                  placeholder="Rudolph"
                  type="text"
                />
              </Field>
              <Field className="col-span-2">
                <Label>Address</Label>
                <Input
                  autoComplete="street-address"
                  defaultValue={user.address || ''}
                  name="address"
                  placeholder="Stable #9, North Pole, H0H 0H0"
                  type="text"
                  className="colspan-1"
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <Field>
                <Label>Shirt Size</Label>
                <Input
                  autoComplete="shirt-size"
                  defaultValue={user.shirt_size || ''}
                  name="shirt_size"
                  placeholder="S/M"
                  type="text"
                />
              </Field>
              <Field>
                <Label>Pant Size</Label>
                <Input
                  autoComplete="pant-size"
                  defaultValue={user.pant_size || ''}
                  name="pant_size"
                  placeholder="XL"
                  type="text"
                />
              </Field>
              <Field>
                <Label>Shoe Size</Label>
                <Input
                  autoComplete="shoe-size"
                  defaultValue={user.shoe_size || ''}
                  inputMode="decimal"
                  name="shoe_size"
                  placeholder="7.5"
                  type="text"
                />
              </Field>
            </div>
          </FieldGroup>
        </Fieldset>
      </div>
      <div className="mt-4 sm:mt-6 flex items-center justify-end gap-x-6 p-4">
        <Button
          plain
          onClick={() => {
            signOut({ callbackUrl: '/', redirect: true });
          }}
          type="button"
        >
          <span className="text-red-500">Sign Out</span>
        </Button>

        <Button
          plain
          onClick={() => {
            router.back();
          }}
          type="button"
        >
          Back
        </Button>
        <Button color="indigo" type="submit">
          {pending ? 'Loading...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

export default UserForm;
