import type { User } from '@prisma/client';
import { Card } from '@repo/ui/card';
import { AtSign, Footprints, Locate, Magnet, Pen, Shirt } from 'lucide-react';

interface UserProfileProps {
  user: User;
  currentUserId: string;
}

export function UserProfile({ user, currentUserId }: UserProfileProps) {
  const {
    id,
    name,
    email,
    address,
    shirt_size: shirtSize,
    shoe_size: shoeSize,
    pant_size: pantSize,
  } = user;
  const isUserProfile = currentUserId === id;
  const nameOrEmailOrDefault = name || email || 'Anonymous';
  const title = isUserProfile
    ? `Your Profile`
    : `${nameOrEmailOrDefault}'s Profile`;
  const fields = [
    {
      icon: Pen,
      content: name,
      label: 'Name',
    },
    {
      icon: AtSign,
      content: email,
      label: 'Email',
    },
    {
      icon: Locate,
      content: address,
      label: 'Address',
    },
    {
      icon: Footprints,
      content: shoeSize,
      label: 'Shoe Size',
    },
    {
      icon: Magnet,
      content: pantSize,
      label: 'Pant Size',
    },
    {
      icon: Shirt,
      content: shirtSize,
      label: 'Shirt Size',
    },
  ];

  const fieldsMarkup = fields.map((field) => {
    if (!field.content) return null;
    return (
      <div className="flex flex-col items-left text-left" key={field.label}>
        <div className="text-xs">{field.label}</div>
        <div className="text-sm flex flex-grow font-bold dark:text-gray-200">
          {field.content}
        </div>
      </div>
    );
  });

  return (
    <Card title={title}>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {fieldsMarkup}
      </div>
    </Card>
  );
}
