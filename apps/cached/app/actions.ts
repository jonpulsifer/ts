'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { createClient } from 'redis';

const INITIAL_EMOJI = '🦄';
const FUN_EMOJIS = ['😎', '🚀', '🌈', '🦄', '🍕', '🎉', '🌮', '🧙‍♂️', '🏄‍♂️'];

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  database: 2,
});
redis.connect();

// Initialize Redis with default emoji if not exists
redis.get('emoji').then((result) => {
  if (!result) redis.set('emoji', INITIAL_EMOJI);
});

export const getEmoji = unstable_cache(
  async () => {
    const currentEmoji = await redis.get('emoji');
    console.log('got emoji from redis', currentEmoji);
    return {
      emoji: currentEmoji,
      timestamp: new Date().toISOString(),
      node: process.env.NODE_NAME,
      pod: process.env.POD_NAME,
    };
  },
  ['emoji-cache-key'],
  { revalidate: 300, tags: ['emoji'] },
);

export async function setEmoji(formData: FormData) {
  const emoji = formData.get('emoji') as string;
  await redis.set('emoji', emoji);
  revalidateTag('emoji');
}

export async function revalidateEmoji() {
  const newEmoji = FUN_EMOJIS[Math.floor(Math.random() * FUN_EMOJIS.length)];
  await redis.set('emoji', newEmoji);
  revalidatePath('/');
}
