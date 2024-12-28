import OpenAI from 'openai';

import { getFullUserById } from './db/queries-cached';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type GiftRecommendation = {
  name: string;
  description: string;
  estimatedPrice?: string;
};

export const getRecommendations = async (userId: string) => {
  const user = await getFullUserById(userId);
  const preferences = user?.gifts.map((gift) => gift.name).join(', ');
  const name = user?.name?.split(' ')[0] || 'someone mysterious';
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Ho ho ho! I'm Santa Claus, here to help you pick the perfect Christmas gifts for someone special. Based on their wishlist items, suggest a wide variety of delightful and unique presents that will bring joy and cheer this holiday season. Format your output in plain text, no markdown. Do not recommend items that are part of the wishlist already. Respond playfully in only a few sentences. Begin your response with a fun summary about the recipient's gifts. Include your reasoning.`,
      },
      {
        role: 'user',
        content: `The person I'm buying for is named: ${name} and has these items on their Christmas wishlist: ${preferences}. What would Santa recommend as great Christmas gifts for them?`,
      },
    ],
    temperature: 1.0,
  });

  return completion.choices[0]?.message?.content;
};

export const getRecommendationsForHomePage = async (
  userId: string,
): Promise<GiftRecommendation[]> => {
  const user = await getFullUserById(userId);
  const preferences = user?.gifts.map((gift) => gift.name).join(', ');
  const name = user?.name?.split(' ')[0] || 'someone mysterious';

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_gift_recommendations',
          description: 'Get gift recommendations for the user',
          parameters: {
            type: 'object',
            properties: {
              recommendations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    estimatedPrice: { type: 'string' },
                  },
                  required: ['name', 'description'],
                },
              },
            },
          },
        },
      },
    ],
    tool_choice: {
      type: 'function',
      function: { name: 'get_gift_recommendations' },
    },
    messages: [
      {
        role: 'system',
        content: `You are a gift recommendation expert. Based on a user's wishlist, suggest 5 unique and thoughtful gift ideas. Each recommendation should include a name, description, and estimated price range. Be creative and consider the user's interests.`,
      },
      {
        role: 'user',
        content: `The person I'm buying for is named: ${name} and has these items on their Christmas wishlist: ${preferences}. What would you recommend as great gift ideas for them?`,
      },
    ],
    temperature: 1.0,
  });

  const firstCall = completion.choices[0]?.message?.tool_calls?.[0];
  if (!firstCall || firstCall.function.name !== 'get_gift_recommendations') {
    return [];
  }

  const { recommendations } = JSON.parse(firstCall.function.arguments || '{}');
  return recommendations;
};
