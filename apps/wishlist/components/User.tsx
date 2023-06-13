'use client';

import {
  faSignature,
  faAt,
  faLocationDot,
  faLayerGroup,
  faSocks,
  faPersonRunning,
  faShirt,
  faUserEdit,
  faPeopleRoof,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Suspense } from 'react';
import { AppUser, Gift } from '../types';
import { useAuth } from './AuthProvider';
import Card, { CardAction } from './Card';
import GiftList from './GiftList';

interface Props {
  gifts: Gift[];
  appUser: AppUser;
}

export const UserProfile = ({ gifts, appUser }: Props) => {
  const { user } = useAuth();
  const isUserProfile = user?.uid === appUser.uid;

  const {
    uid,
    name,
    email,
    address,
    shirt_size,
    shoe_size,
    pant_size,
    gift_theme,
  } = appUser;

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
    {
      icon: faLayerGroup,
      content: gift_theme,
    },
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
        className="flex flex-row items-center p-4"
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
        title: 'Join a Family',
        icon: faPeopleRoof,
        link: '/family/join',
      },
    );
  return (
    <Suspense fallback={<Card title="Loading..." />}>
      <Card action={actions}>{fieldsMarkup}</Card>
      <GiftList gifts={gifts} />
    </Suspense>
  );
};
