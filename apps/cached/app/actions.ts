'use server';

import { revalidatePath } from 'next/cache';

const INITIAL_EMOJI = '🦄';
const FUN_EMOJIS = ['😎', '🚀', '🌈', '🦄', '🍕', '🎉', '🌮', '🧙‍♂️', '🏄‍♂️'];

// Simple in-memory store
const db = new Map<string, string>([['emoji', INITIAL_EMOJI]]);

export async function getEmoji() {
  return db.get('emoji') ?? INITIAL_EMOJI;
}

export async function setEmoji(formData: FormData) {
  const emoji = formData.get('emoji') as string;
  db.set('emoji', emoji);
  revalidatePath('/');
}

export async function revalidateEmoji() {
  const newEmoji = FUN_EMOJIS[Math.floor(Math.random() * FUN_EMOJIS.length)];
  db.set('emoji', newEmoji);
  revalidatePath('/');
}
