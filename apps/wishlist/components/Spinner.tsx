import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faGhost,
  faGift,
  faGifts,
  faHollyBerry,
  faSleigh,
  faSnowman,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface Props {
  icon?: IconDefinition;
}

const Spinner = ({ icon = faGift }: Props) => {
  const icons = [faGift, faGifts, faSnowman, faHollyBerry, faGhost, faSleigh];
  icon = icons[Math.floor(Math.random() * icons.length)];
  return (
    <div className="flex justify-center items-center h-full">
      <FontAwesomeIcon
        className="animate-spin text-7xl text-indigo-600 dark:text-indigo-500"
        icon={icon}
      />
    </div>
  );
};

export default Spinner;
