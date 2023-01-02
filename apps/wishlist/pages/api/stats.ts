// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase-ssr-db';

export default async function stats(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  const gifts = db.collection('gifts').count();
  const users = db.collection('users').count();
  const claimed = db.collection('gifts').where('claimed_by', '!=', '').count();
  res.status(200).json({ gifts, users, claimed });
}
