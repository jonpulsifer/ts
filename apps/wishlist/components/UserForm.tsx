'use client';

import type { User } from '@prisma/client';
import { Button } from '@repo/ui/button';
import { Field, FieldGroup, Fieldset, Label, Legend } from '@repo/ui/fieldset';
import { Input } from '@repo/ui/input';
import { Text } from '@repo/ui/text';
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
    <form action={clientEditUser} id="editUser">
      <div className="border-b border-gray-900/10 pb-12 p-4">
        <Fieldset>
          <Legend>Profile Details</Legend>
          <Text>
            Without this Santa might not be able to deliver your gifts!
          </Text>
          <FieldGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <Field>
                <Label>Name</Label>
                <Input
                  autoComplete="name"
                  name="name"
                  defaultValue={user.name || ''}
                  placeholder="Rudolph"
                  type="text"
                />
              </Field>
              <Field>
                <Label>Email</Label>
                <Input
                  autoComplete="street-address"
                  defaultValue={user.email}
                  name="email"
                  disabled
                  type="text"
                />
              </Field>
            </div>
            <Field>
              <Label>Address</Label>
              <Input
                autoComplete="street-address"
                defaultValue={user.address || ''}
                name="address"
                placeholder="Stable #9, North Pole, H0H 0H0"
                type="text"
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
              <Field>
                <Label>Shirt Size</Label>
                <Input
                  autoComplete="shirt-size"
                  defaultValue={user.shirt_size || ''}
                  name="shirt_size"
                  placeholder="S/M"
                  type="text"
                  className="colspan-1"
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
                  className="colspan-1"
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
                  className="colspan-1"
                />
              </Field>
            </div>
          </FieldGroup>
        </Fieldset>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button
          plain
          onClick={() => {
            router.back();
          }}
          type="button"
        >
          Back
        </Button>
        <Button color="indigo" onClick={() => clientEditUser} type="submit">
          Save
        </Button>
      </div>
    </form>
  );
}

export default UserForm;
