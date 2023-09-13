import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// import file from filesystem
import * as myJson from './data/my.json';

export async function GET() {
  const res = Object.create(null);
  for (const [key, value] of headers().entries()) {
    res[key] = value;
  }
  // do stuff with file to get data
  const { data } = myJson;

  // use data
  res['fromFile'] = data;
  return NextResponse.json({ ...res });
}
