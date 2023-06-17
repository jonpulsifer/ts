import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface Props {
  icon?: IconDefinition;
}

const Spinner = ({ icon = faGift }: Props) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div>
        <FontAwesomeIcon
          className="animate-spin text-7xl text-white dark:text-slate-100"
          icon={icon}
        />
      </div>
    </div>
  );
};

export default Spinner;
