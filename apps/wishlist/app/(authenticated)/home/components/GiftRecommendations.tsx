import { Button, Strong, Text } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { GiftRecommendation } from 'lib/prisma-ssr';
import { useState } from 'react';

export function GiftRecommendations() {
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateRecommendations = async () => {
    setIsLoading(true);
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data && 'error' in data) {
      console.error(data.error);
    } else if (data) {
      setRecommendations(data.recommendations as GiftRecommendation[]);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={handleGenerateRecommendations}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-bold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:shadow-xl"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block mr-2"
            >
              ⚡
            </motion.div>
          ) : (
            '✨'
          )}
          {isLoading ? 'Asking the robot elves...' : 'Generate New Ideas!'}
        </Button>
      </motion.div>

      <AnimatePresence>
        {recommendations.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {recommendations.map((recommendation, index) => (
              <motion.div
                key={`${recommendation.name}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border dark:border-purple-600 border-purple-200 rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
              >
                <Strong className="block mb-3 text-lg text-purple-700">
                  {recommendation.name}
                </Strong>
                <Text className="text-sm block mb-4 break-words text-gray-600">
                  {recommendation.description}
                </Text>
                <Strong className="text-sm font-medium text-pink-600">
                  Estimated Price: {recommendation.estimatedPrice}
                </Strong>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-500 italic"
          >
            No recommendations yet. Click the button above to generate some
            magical gift ideas!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}