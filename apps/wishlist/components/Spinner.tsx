import { CubeTransparentIcon } from '@heroicons/react/16/solid';
import React from 'react';

interface Props {
  Icon?: typeof CubeTransparentIcon;
}

const LOADING_MESSAGES = [
  'Makin a list, checkin it twice',
  'Oh no, the Grinch stole the gifts!',
  'Santa is on his way',
  'Making sure the reindeer are fed',
  'No coal for you',
  'Checking the naughty list',
  'Checking the nice list',
  'Putting up the tree',
  'Putting up the lights',
  'Wrapping presents',
  'Making hot chocolate',
  'Making cookies for Santa',
];

const PulsingText = () => {
  const loadingMessage =
    LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
  return (
    <div className="flex flex-row items-center">
      <h1 className="animate-pulse text-xl opacity-10 font-bold dark:text-indigo-500 text-indigo-600 tracking-tight">
        {loadingMessage}
      </h1>
    </div>
  );
};

function Spinner({ Icon = CubeTransparentIcon }: Props) {
  return (
    <div className="h-full">
      <div className="flex flex-col gap-2 justify-center items-center  h-full">
        <div className="animate-pulse h-full items-center justify-center text-indigo-600 dark:text-indigo-500">
          <Icon className="w-16 h-16" />
        </div>
        <PulsingText />
      </div>
    </div>
  );
}

export default Spinner;
