'use client';

import { Button } from '@repo/ui';
import { useRouter } from 'next/navigation';

import { updateUserOnboardingStatus } from '../../../actions';

interface CompleteOnboardingButtonProps {
  userId: string;
}

export function CompleteOnboardingButton({
  userId,
}: CompleteOnboardingButtonProps) {
  const router = useRouter();

  const completeOnboarding = async () => {
    await updateUserOnboardingStatus(userId, true);
    router.push('/home');
  };

  return <Button onClick={completeOnboarding}>Let&apos;s Get Started!</Button>;
}
