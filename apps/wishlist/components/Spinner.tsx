import { Cog6ToothIcon } from '@heroicons/react/20/solid';
import { Heading, Subheading } from '@repo/ui';
import React from 'react';

import { Logo } from './logo';

interface Props {
  Icon?: typeof Cog6ToothIcon;
}

const LOADING_MESSAGES = [
  'Makin a list, checkin it twice',
  'Oh no, the Grinch stole the gifts!',
  'Santa is on his way',
  'Making sure the reindeer are fed',
  'Checking the naughty list',
  'Checking the nice list',
  'Putting up the tree',
  'Putting up the lights',
  'Wrapping presents',
  'Making hot chocolate',
  'Making cookies for Santa',
];

function Spinner({ Icon = Cog6ToothIcon }: Props) {
  const loadingMessage =
    LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
  return (
    <div className="min-h-48 animate-pulse flex flex-col gap-2 justify-center items-center">
      <div className="relative animate-spin-slower w-20 h-20">
        <Icon />
        <Logo className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      <Heading>{loadingMessage}</Heading>
      <Subheading>One moment...</Subheading>
    </div>
  );
}

export default Spinner;
