// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { LoginTicket } from 'google-auth-library';
import type { NextApiRequest, NextApiResponse } from 'next';
import validateIdToken from '../../lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    // no token, sadpanda
    return res.status(401).send({ error: 'Unauthorized' });
  }

  validateIdToken(token)
    .then((ticket: LoginTicket) => {
      const payload = ticket.getPayload();
      if (!payload) return res.status(500); // something went wrong, we should always have a payload

      // yay we are vauthenticated
      const { email } = payload;
      if (email)
        return res.status(200).json({ email, message: 'Authenticated' });
    })
    .catch((err) => {
      // could not validate token, sadpanda
      console.log('error', err);
      return res.status(401).send({ error: 'Unauthorized' });
    });
}
