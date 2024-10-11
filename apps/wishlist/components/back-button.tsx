'use client';

import { Button } from '@repo/ui/button';
import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();
  return (
    <Button outline onClick={() => router.back()}>
      Back
    </Button>
  );
}
