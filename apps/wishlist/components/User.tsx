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
    },
    {
      icon: faAt,
      content: email,
    },
    {
      icon: faLocationDot,
      content: address,
    },
    // {
    //   icon: faLayerGroup,
    //   content: gift_theme,
    // },
    {
      icon: faSocks,
      content: shoe_size,
    },
    {
      icon: faPersonRunning,
      content: pant_size,
    },
    {
      icon: faShirt,
      content: shirt_size,
    },
  ];

  const fieldsMarkup = fields.map((field, i) => {
    if (!field.content) return null;
    return (
      <div
        key={`${field.icon}-${i}`}
        className="flex flex-row items-center truncate"
      >
        <FontAwesomeIcon
          icon={field.icon}
          className="w-10 shrink-0 text-center"
        />
        {field.content}
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
        link: '/family/join',
      },
    );
  return (
    <Card title={title} action={actions}>
      <div className="flex flex-row gap-4">{fieldsMarkup}</div>
    </Card>
  );
};
