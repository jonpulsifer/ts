'use client';

import {
  faAt,
  faLocationDot,
  faPeopleRoof,
  faPersonRunning,
  faShirt,
  faSignature,
  faSocks,
  faUserEdit,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { Card, CardAction } from 'ui';

interface Props {
  user: User;
}

export const UserProfile = ({ user }: Props) => {
  const { data: session } = useSession();
  const { id, name, email, address, shirt_size, shoe_size, pant_size } = user;
  const isUserProfile = session?.user?.id === id;
  const title = isUserProfile ? `Your Profile` : `${user?.name}'s Profile`;
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
    // {
    //   icon: faLayerGroup,
    //   content: gift_theme,
    // },
    {
      icon: faSocks,
      content: shoe_size,
      label: 'Shoe Size',
    },
    {
      icon: faPersonRunning,
      content: pant_size,
      label: 'Pant Size',
    },
    {
      icon: faShirt,
      content: shirt_size,
      label: 'Shirt Size',
    },
  ];

  const fieldsMarkup = fields.map((field, i) => {
    if (!field.content) return null;
    return (
      <div key={i} className="flex flex-row justify-between">
        <div className="flex flex-row gap-2">
          <FontAwesomeIcon icon={field.icon} />
          <span>{field.label}</span>
        </div>
        <div
          style={field.label === 'Address' ? { whiteSpace: 'pre-wrap' } : {}}
        >
          {field.content}
        </div>{' '}
      </div>
    );
  });

  const actions: CardAction[] = [];
  if (isUserProfile)
    actions.push(
      {
        icon: faUserEdit,
        title: 'Edit Profile',
        link: `/user/${id}/edit`,
      },
      {
        title: 'View Wishlists',
        icon: faPeopleRoof,
        link: '/wishlists',
      },
    );
  return (
    <Card title={title} action={actions}>
      <div className="flex flex-col gap-4 px-4">{fieldsMarkup}</div>
    </Card>
  );
};
