'use server';

import { revalidateTag } from 'next/cache';
import { unstable_cache } from 'next/cache';

const INITIAL_EMOJI = '🦄';
const FUN_EMOJIS = ['😎', '🚀', '🌈', '🦄', '🍕', '🎉', '🌮', '🧙‍♂️', '🏄‍♂️'];
const db = new Map<string, string>([['emoji', INITIAL_EMOJI]]);

// Simulate DB latency
const simulateLatency = () =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 500));

// Add timestamp to see when cache was last updated
export const getEmoji = unstable_cache(
  async () => {
    await simulateLatency();
    const currentEmoji = db.get('emoji') ?? INITIAL_EMOJI;
    return {
      emoji: currentEmoji,
      timestamp: new Date().toISOString(),
      node: process.env.NODE_NAME,
      pod: process.env.POD_NAME,
    };
  },
  ['emoji-cache-key'],
  { revalidate: 30, tags: ['emoji'] },
);

export async function setEmoji(formData: FormData) {
  const emoji = formData.get('emoji') as string;
  db.set('emoji', emoji);
  revalidateTag('emoji');
}

export async function revalidateEmoji() {
  const newEmoji = FUN_EMOJIS[Math.floor(Math.random() * FUN_EMOJIS.length)];
  db.set('emoji', newEmoji);
  revalidateTag('emoji');
}
