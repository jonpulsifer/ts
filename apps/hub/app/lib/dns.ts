import { headers as requestHeaders } from 'next/headers';

export const ipToName = async () => {
  const headers = requestHeaders();
  const ip = headers.get('x-real-ip') || headers.get('x-forwarded-for') || '';
  if (process.env.NODE_ENV === 'development') {
    return 'Development';
  }
  switch (true) {
    case ip === '10.1.0.5':
    case ip === '10.1.0.127':
    case ip === '10.2.0.28':
      return 'Jonathan';
    case ip === '10.2.0.23':
      return 'Constance';
    default:
      return ip;
  }
};
