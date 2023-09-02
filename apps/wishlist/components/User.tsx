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
import { Card, CardAction } from 'ui';

import { AppUser } from '../types';
import { useAuth } from './AuthProvider';

interface Props {
  appUser: AppUser;
}

export const UserProfile = ({ appUser }: Props) => {
  const { user } = useAuth();
  const isUserProfile = user?.uid === appUser.uid;

  const { uid, name, email, address, shirt_size, shoe_size, pant_size } =
    appUser;

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
        link: `/user/${uid}/edit`,
      },
      {
        title: 'View Wishlists',
        icon: faPeopleRoof,
        link: '/family/join',
      },
    );
  return (
    <Card
      // title={isUserProfile ? `Your Profile` : `${user?.displayName}'s Profile`}
      action={actions}
    >
      <div className="flex flex-col">{fieldsMarkup}</div>
    </Card>
  );
};
