'use server';

import { revalidateTag } from 'next/cache';
import { unstable_cache } from 'next/cache';

const INITIAL_EMOJI = '🦄';
const FUN_EMOJIS = ['😎', '🚀', '🌈', '🦄', '🍕', '🎉', '🌮', '🧙‍♂️', '🏄‍♂️'];
const db = new Map<string, string>([['emoji', INITIAL_EMOJI]]);

// Add timestamp to see when cache was last updated
export const getEmoji = unstable_cache(
  async () => {
    const currentEmoji = db.get('emoji');
    console.log('got emoji from db', currentEmoji);
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
  db.set('emoji', emoji);
  revalidateTag('emoji');
}

export async function revalidateEmoji() {
  const newEmoji = FUN_EMOJIS[Math.floor(Math.random() * FUN_EMOJIS.length)];
  db.set('emoji', newEmoji);
  revalidateTag('emoji');
}
