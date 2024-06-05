'use client';

import { Link } from '@repo/ui/link';
import Image from 'next/image';

type Props = {
  className?: string;
};

export function Logo({ className }: Props) {
  const classes = `ml-2 lg:ml-0 ${className}`;
  return (
    <div className={classes}>
      <Link href="/">
        <Image
          priority
          width={36}
          height={36}
          src="/santaicon.png"
          alt="Logo"
        />
      </Link>
    </div>
  );
}
