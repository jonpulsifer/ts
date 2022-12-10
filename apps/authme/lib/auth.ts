import { OAuth2Client } from 'google-auth-library';

export default async function verifyIdToken(idToken: string) {
  const audience = process.env.JWT_EXPECTED_AUDIENCE;
  const oAuth2Client = new OAuth2Client();
  return oAuth2Client.verifyIdToken({ idToken, audience });
}
