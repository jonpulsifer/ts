import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      rev: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
