'use client';

import { Heading, Text } from '@repo/ui';

type GiftRecommendationsProps = {
  recommendations: string;
};

const GiftRecommendations = ({ recommendations }: GiftRecommendationsProps) => {
  return (
    <div>
      <Heading>AI-Generated Gift Recommendations</Heading>
      {recommendations && (
        <div>
          <Text>{recommendations}</Text>
        </div>
      )}
    </div>
  );
};

export default GiftRecommendations;
