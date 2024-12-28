'use client';

import { Link } from '@repo/ui/link';
import Image from 'next/image';

type Props = {
  className?: string;
  size?: number;
};

export function Logo({ className, size = 36 }: Props) {
  const classes = `ml-2 lg:ml-0 ${className}`;
  return (
    <div className={classes}>
      <Link href="/home">
        <Image
          priority
          width={size}
          height={size}
          src="/santaicon.png"
          alt="Santa Icon"
        />
      </Link>
    </div>
  );
}
