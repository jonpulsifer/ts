// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { LoginTicket } from 'google-auth-library';
import type { NextApiRequest, NextApiResponse } from 'next';

import verifyIdToken from '../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  await verifyIdToken(token)
    .then((ticket: LoginTicket) => {
      // yay this route is protected

      const payload = ticket.getPayload();

      if (!payload)
        return res.status(500).json({ error: 'Internal Server Error' }); // something went wrong, we should always have a payload

      // yay we are authenticated
      const { email } = payload;
      if (email)
        return res.status(200).json({ email, message: 'Authenticated' });
    })
    .catch((err) => {
      // could not validate token, sadpanda
      console.log('error', err);
      return res.status(401).json({ error: 'Unauthorized' });
    });
}
