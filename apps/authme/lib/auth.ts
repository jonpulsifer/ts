import { OAuth2Client } from 'google-auth-library';

export default async function validateIdToken(idToken: string) {
  const expectedAudience = `32555940559.apps.googleusercontent.com`;
  const issuers = ['https://accounts.google.com'];
  const oAuth2Client = new OAuth2Client();
  const response = await oAuth2Client.getFederatedSignonCertsAsync();
  return oAuth2Client.verifySignedJwtWithCertsAsync(
    idToken,
    response.certs,
    expectedAudience,
    issuers,
  );
}
