import type { User } from '@prisma/client';

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
    <div>
      <div className="text-xs">Name</div>
      <div className="text-sm font-bold dark:text-gray-200 col-span-1">
        {name || 'n/a'}
      </div>
    </div>
  ) : null;

  const emailMarkup = email ? (
    <div>
      <div className="text-xs">Email</div>
      <div className="text-sm font-bold dark:text-gray-200 col-span-1">
        {email}
      </div>
    </div>
  ) : null;

  const addressMarkup = address ? (
    <div className="sm:col-span-3">
      <div className="text-xs">Address</div>
      <div className="text-sm font-bold dark:text-gray-200 col-span-2">
        {address || 'n/a'}
      </div>
    </div>
  ) : null;

  const shirtSizeMarkup = shirtSize ? (
    <div className="sm:col-span-1">
      <div className="text-xs">Shirt Size</div>
      <div className="text-sm font-bold dark:text-gray-200">
        {shirtSize || 'n/a'}
      </div>
    </div>
  ) : null;

  const shoeSizeMarkup = shoeSize ? (
    <div className="sm:col-span-1">
      <div className="text-xs">Shoe Size</div>
      <div className="text-sm font-bold dark:text-gray-200">
        {shoeSize || 'n/a'}
      </div>
    </div>
  ) : null;

  const pantSizeMarkup = pantSize ? (
    <div className="sm:col-span-1">
      <div className="text-xs">Pant Size</div>
      <div className="text-sm font-bold dark:text-gray-200">
        {pantSize || 'n/a'}
      </div>
    </div>
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
