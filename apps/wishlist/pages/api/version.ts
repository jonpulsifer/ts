// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

export default function healthz(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ rev: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA });
}
