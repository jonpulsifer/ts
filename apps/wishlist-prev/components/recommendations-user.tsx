'use client';

import type { User } from '@prisma/client';
import { Button, Subheading, Text } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

type GiftRecommendationsProps = {
  forUser: Pick<User, 'id' | 'name' | 'email'>;
};

export const GiftRecommendationsFallback = (
  <div className="my-4">
    <Subheading>SantaBot Recommendations</Subheading>
    <Text className="animate-pulse">🤖 Loading new recommendations...</Text>
  </div>
);

const GiftRecommendations = ({ forUser: user }: GiftRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/recommendations/${user.id}`, {
        method: 'POST',
      });
      const data = await response.json();
      setRecommendations(data?.recommendations ?? []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-4">
      <Subheading>
        Ask Santa what to get for {user.name || user.email}
      </Subheading>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={handleGenerateRecommendations}
          disabled={isLoading}
          className="w-full py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-bold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:shadow-xl"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
              className="inline-block mr-2"
            >
              ⚡
            </motion.div>
          ) : (
            '✨'
          )}
          {isLoading ? 'Generating ideas...' : "Get Santa's Recommendations"}
        </Button>
      </motion.div>
      <AnimatePresence>
        {recommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
            <Text>{recommendations}</Text>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftRecommendations;
