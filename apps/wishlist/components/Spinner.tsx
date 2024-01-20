import { Gift, LucideIcon } from 'lucide-react';
import React from 'react';

interface Props {
  Icon?: LucideIcon;
}

function Spinner({ Icon = Gift }: Props) {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin text-indigo-600 dark:text-indigo-500">
        <Icon width={96} />
      </div>
    </div>
  );
}

export default Spinner;
