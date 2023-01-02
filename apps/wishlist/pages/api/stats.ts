// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase-ssr';

export default async function healthz(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  const gifts = await db.collection('gifts').count();
  const users = await db.collection('users').count();
  const claimed = await db
    .collection('gifts')
    .where('claimed_by', '!=', '')
    .count();
  res.status(200).json({ gifts, users, claimed });
}
