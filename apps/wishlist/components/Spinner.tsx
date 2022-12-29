import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift } from '@fortawesome/free-solid-svg-icons';

const Spinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div>
      <FontAwesomeIcon
        className="animate-spin text-7xl text-white"
        icon={faGift}
      />
    </div>
  </div>
);

export default Spinner;
