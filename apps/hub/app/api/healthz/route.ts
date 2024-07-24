import { NextResponse } from 'next/server';

import redis from '../../lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pong = await redis.ping();
  return NextResponse.json({ pong });
}
