import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const res = Object.create(null);
  for (const [key, value] of headers().entries()) {
    res[key] = value;
  }
  return NextResponse.json({ ...res });
}
