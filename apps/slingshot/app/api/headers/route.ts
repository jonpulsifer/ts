import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { sanitizeHeaders } from '@/lib/sanitize-headers';

import * as myJson from './data/my.json';

export async function GET(): Promise<NextResponse> {
  const headersList = await headers();
  const rawHeaders: Record<string, string> = {};
  for (const [key, value] of headersList.entries()) {
    rawHeaders[key] = value;
  }

  // Sanitize headers to remove sensitive tokens
  const res = sanitizeHeaders(rawHeaders);

  // do stuff with file to get data
  const { data } = myJson;

  // use data
  res.fromFile = data;
  return NextResponse.json({ ...res });
}
