import {
  faAt,
  faLocationDot,
  faPersonRunning,
  faShirt,
  faSignature,
  faSocks,
} from '@fortawesome/free-solid-svg-icons';
import type { User } from '@prisma/client';
import { Card } from '@repo/ui/card';

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
      icon: faSignature,
      content: name,
      label: 'Name',
    },
    {
      icon: faAt,
      content: email,
      label: 'Email',
    },
    {
      icon: faLocationDot,
      content: address,
      label: 'Address',
    },
    {
      icon: faSocks,
      content: shoeSize,
      label: 'Shoe Size',
    },
    {
      icon: faPersonRunning,
      content: pantSize,
      label: 'Pant Size',
    },
    {
      icon: faShirt,
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
