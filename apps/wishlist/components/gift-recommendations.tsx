'use client';

import { Subheading, Text } from '@repo/ui';

type GiftRecommendationsProps = {
  recommendations: string;
};

const GiftRecommendations = ({ recommendations }: GiftRecommendationsProps) => {
  return (
    <div className="my-4">
      <Subheading>Santa's Gift Recommendations</Subheading>
      {recommendations && (
        <div>
          <Text>{recommendations}</Text>
        </div>
      )}
    </div>
  );
};

export default GiftRecommendations;
