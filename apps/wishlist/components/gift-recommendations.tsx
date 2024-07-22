import { Subheading, Text } from '@repo/ui';
import { getRecommendations } from 'lib/prisma-ssr';

type GiftRecommendationsProps = {
  userId: string;
};

export const GiftRecommendationsFallback = (
  <div className="my-4">
    <Subheading>SantaBot Recommendations</Subheading>
    <Text className="animate-pulse">🤖 Loading new recommendations...</Text>
  </div>
);

const GiftRecommendations = async ({ userId }: GiftRecommendationsProps) => {
  const recommendations = await getRecommendations(userId);
  return (
    <div className="my-4">
      <Subheading>SantaBot Recommendations</Subheading>
      <Text>{recommendations}</Text>
    </div>
  );
};

export default GiftRecommendations;
