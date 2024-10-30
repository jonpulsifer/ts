import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import * as myJson from './data/my.json';

export async function GET(): Promise<NextResponse> {
  const res = Object.create(null);
  const headersList = await headers();
  for (const [key, value] of headersList.entries()) {
    res[key] = value;
  }
  // do stuff with file to get data
  const { data } = myJson;

  // use data
  res.fromFile = data;
  return NextResponse.json({ ...res });
}
