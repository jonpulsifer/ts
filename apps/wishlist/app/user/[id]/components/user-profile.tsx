import type { User } from '@prisma/client';
import { Fieldset, Label, Text } from '@repo/ui';

interface UserProfileProps {
  user: User;
  currentUserId: string;
}

export function UserProfile({ user }: UserProfileProps) {
  const {
    name,
    email,
    address,
    shirt_size: shirtSize,
    shoe_size: shoeSize,
    pant_size: pantSize,
  } = user;

  const nameMarkup = name ? (
    <Fieldset>
      <Label>Name</Label>
      <Text className="col-span-1">{name || 'n/a'}</Text>
    </Fieldset>
  ) : null;

  const emailMarkup = email ? (
    <Fieldset>
      <Label>Email</Label>
      <Text className="col-span-1">{email}</Text>
    </Fieldset>
  ) : null;

  const addressMarkup = address ? (
    <Fieldset className="sm:col-span-3">
      <Label>Address</Label>
      <Text className="col-span-2">{address || 'n/a'}</Text>
    </Fieldset>
  ) : null;

  const shirtSizeMarkup = shirtSize ? (
    <Fieldset className="sm:col-span-1">
      <Label>Shirt Size</Label>
      <Text>{shirtSize || 'n/a'}</Text>
    </Fieldset>
  ) : null;

  const shoeSizeMarkup = shoeSize ? (
    <Fieldset className="sm:col-span-1">
      <Label>Shoe Size</Label>
      <Text>{shoeSize || 'n/a'}</Text>
    </Fieldset>
  ) : null;

  const pantSizeMarkup = pantSize ? (
    <Fieldset className="sm:col-span-1">
      <Label>Pant Size</Label>
      <Text>{pantSize || 'n/a'}</Text>
    </Fieldset>
  ) : null;

  const sizesMarkup =
    shirtSizeMarkup || shoeSizeMarkup || pantSizeMarkup ? (
      <div className="grid grid-cols-3 gap-4 sm:gap-8 sm:col-span-2">
        {' '}
        {shirtSizeMarkup}
        {shoeSizeMarkup}
        {pantSizeMarkup}
      </div>
    ) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
      {nameMarkup}
      {emailMarkup}
      {addressMarkup}
      {sizesMarkup}
    </div>
  );
}
