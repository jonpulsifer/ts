import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const ip = headers().get('x-real-ip') || headers().get('x-forwarded-for');

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
