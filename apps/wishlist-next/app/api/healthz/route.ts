import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const h = await headers();
  const ip = h.get('x-real-ip') || h.get('x-forwarded-for');

  return NextResponse.json(
    {
      status: 'ok',
      rev: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
      ip,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
