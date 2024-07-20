import { CogIcon } from '@heroicons/react/16/solid';
import { Button, Divider, Heading } from '@repo/ui';
import GiftRecommendations from 'components/gift-recommendations';
import { GiftTable } from 'components/gift-table';
import { getGiftsWithOwnerByUserId, getMe } from 'lib/prisma-ssr';
import type { Metadata } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'View your profile',
};

const getRecommendations = async (userId: string) => {
  console.log('getRecommendations');
  const gifts = await getGiftsWithOwnerByUserId(userId);
  const preferences = gifts.map((gift) => gift.name).join(', ');
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert gift recommender AI. Based on the user's preferences and wishlist items, provide thoughtful and creative Christmas gift suggestions. Your recommendations should be diverse and cater to the user's interests. Consider unique, trendy, and popular gift options. Respond conversationally in a couple casual sentences. The format of your response is plain text. No markdown.`,
      },
      {
        role: 'user',
        content: `Here are some items from my wishlist: ${preferences}. Based on these, can you suggest some great Christmas gift ideas?`,
      },
    ],
  });
  console.log(completion);
  return completion.choices[0]?.message?.content;
};

const MePage = async () => {
  console.log('MePage');
  const user = await getMe();
  const gifts = await getGiftsWithOwnerByUserId(user.id);
  const recommendations = await getRecommendations(user.id);
  const recommendationsMarkup = recommendations ? (
    <GiftRecommendations recommendations={recommendations} />
  ) : null;
  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between">
        <Heading>My Profile</Heading>
        <div className="flex gap-4">
          <Button outline href={'/user/settings'}>
            <CogIcon />
            Settings
          </Button>
        </div>
      </div>
      <Divider soft className="my-4" />
      {recommendationsMarkup}
      <GiftTable gifts={gifts} currentUserId={user.id} />
    </>
  );
};

export default MePage;
