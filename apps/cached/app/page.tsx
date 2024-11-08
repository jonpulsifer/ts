import EmojiDisplay from '@/components/emoji-display';
import { getEmoji } from './actions';
import { Suspense } from 'react';

// behave like < next 14
// export const fetchCache = 'force-cache';
// export const dynamic = 'force-dynamic';
// export const revalidate = 3600;

export default async function Home() {
  const emoji = await getEmoji();
  const NODE_NAME = process.env.NODE_NAME;
  const POD_NAME = process.env.POD_NAME;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 space-y-4">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Emoji of the Day
      </h1>
      <Suspense key={emoji} fallback={<div>Loading emoji...</div>}>
        <EmojiDisplay initialEmoji={emoji} />
      </Suspense>
      <div className="grid grid-cols-2 gap-2">
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          NODE_NAME: {NODE_NAME}
        </code>
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          POD_NAME: {POD_NAME}
        </code>
      </div>
    </main>
  );
}
