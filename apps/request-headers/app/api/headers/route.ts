// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const res = Object.create(null);
  for (const [key, value] of headers().entries()) {
    res[key] = value;
  }
  return NextResponse.json({ ...res });
}
