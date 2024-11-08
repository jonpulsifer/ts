import EmojiDisplay from '@/components/emoji-display';
import { getEmoji } from './actions';
import { Suspense } from 'react';

// behave like < next 14
// export const fetchCache = 'force-cache';
// export const dynamic = 'force-dynamic';
// export const revalidate = 3600;

export default async function Home() {
  const emoji = await getEmoji();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400">
      <h1 className="text-6xl font-bold mb-8">Emoji of the Day</h1>
      <Suspense key={emoji} fallback={<div>Loading emoji...</div>}>
        <EmojiDisplay initialEmoji={emoji} />
      </Suspense>
    </main>
  );
}
