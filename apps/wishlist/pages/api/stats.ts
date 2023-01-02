// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { WhereFilterOp } from 'firebase-admin/firestore';
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase-ssr-db';

const getCounts = async (
  collection: string,
  field?: string,
  operator?: WhereFilterOp,
  value?: string,
) => {
  const col = db.collection(collection);
  let query;
  if (field && operator) {
    query = col.where(field, operator, value);
  } else {
    query = col;
  }
  console.log({ field, operator, value });
  const results = await query.count().get();
  return results.data().count;
};

export default async function stats(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  const gifts = await getCounts('gifts');
  const users = await getCounts('users');
  const claimed = await getCounts('gifts', 'claimed_by', '!=', '');
  res.status(200).json({ gifts, users, claimed });
}
