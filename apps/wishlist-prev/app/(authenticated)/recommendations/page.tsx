import { Divider, Heading, Strong, Subheading, Text } from '@repo/ui';
import { auth } from 'app/auth';
import { notFound } from 'next/navigation';
import { GiftRecommendations } from './components/gift-recommendations';
export default async function RecommendationsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    notFound();
  }
  return (
    <>
      <Heading>Generate Gift Recommendations</Heading>
      <Subheading>
        Can't figure what to ask Santa for? Let SantaBot help you out!
      </Subheading>
      <Divider soft className="my-4" />
      <Text className="mb-4">
        Explore personalized gift ideas based on your interests and preferences.
        These recommendations are tailored <Strong>just for you!</Strong>
      </Text>
      <GiftRecommendations userId={user?.id} />
    </>
  );
}
function getUser() {
  throw new Error('Function not implemented.');
}
