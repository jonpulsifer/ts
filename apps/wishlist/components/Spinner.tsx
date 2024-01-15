import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faGift } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface Props {
  icon?: IconDefinition;
}

function Spinner({ icon = faGift }: Props) {
  return (
    <div className="flex justify-center items-center h-full">
      <FontAwesomeIcon
        className="animate-spin text-7xl text-indigo-600 dark:text-indigo-500"
        icon={icon}
      />
    </div>
  );
}

export default Spinner;
