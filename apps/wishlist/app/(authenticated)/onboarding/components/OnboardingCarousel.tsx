'use client';

import { GiftIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/20/solid';
import type { User } from '@prisma/client';
import { Button, Subheading, Text } from '@repo/ui';
import GiftDialog from 'components/gift-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { updateUserOnboardingStatus } from '../../../actions';

interface OnboardingCarouselProps {
  currentUser: Pick<User, 'id' | 'name' | 'email'>;
  users: Pick<User, 'id' | 'name' | 'email'>[];
}

export function OnboardingCarousel({
  currentUser,
  users,
}: OnboardingCarouselProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const router = useRouter();

  const steps = [
    {
      title: 'Create a Gift',
      content:
        "Start by adding a gift to your wishlist. Click the 'Add Gift' button below.",
      icon: <GiftIcon className="w-6 h-6 text-green-500" />,
      action: () => (
        <>
          <Button onClick={() => setIsGiftDialogOpen(true)}>Add Gift</Button>
          <GiftDialog
            setIsOpen={setIsGiftDialogOpen}
            isOpen={isGiftDialogOpen}
            currentUser={currentUser}
            users={users}
          />
        </>
      ),
    },
    {
      title: 'Delete a Gift',
      content:
        "Changed your mind? No problem! You can easily remove gifts from your list. Click the 'Delete Gift' button to remove a gift.",
      icon: <TrashIcon className="w-6 h-6 text-red-500" />,
      action: () => <Button color="red">Delete Gift</Button>,
    },
    {
      title: "Claim Others' Gifts",
      content:
        "See something you'd like to get for someone? You can claim gifts from others' wishlists. Click the 'Claim' button to try it out.",
      icon: <UserGroupIcon className="w-6 h-6 text-blue-500" />,
      action: () => (
        <motion.div
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Button
            color={isClaimed ? 'red' : 'green'}
            onClick={() => setIsClaimed(!isClaimed)}
          >
            {isClaimed ? 'Unclaim' : 'Claim'}
          </Button>
        </motion.div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    await updateUserOnboardingStatus(currentUser.id, true);
    router.push('/home');
  };

  return (
    <div className="space-y-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg shadow-md p-4 max-w-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="p-6 rounded-lg"
        >
          <div className="flex items-center mb-4">
            <div className="mr-2">{steps[currentStep]?.icon}</div>
            <Subheading>{steps[currentStep]?.title}</Subheading>
          </div>
          <Text className="text-sm mb-4">{steps[currentStep]?.content}</Text>
          <div className="mt-4">{steps[currentStep]?.action()}</div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-4">
        <Button outline onClick={prevStep} disabled={currentStep === 0}>
          Previous
        </Button>
        <Button onClick={nextStep}>
          {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
