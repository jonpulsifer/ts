import { headers as requestHeaders } from 'next/headers';

export const ipToName = async () => {
  const ip = getIpFromHeaders();

  console.log(Date.now(), { ip });
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

export const getIpFromHeaders = () => {
  const headers = requestHeaders();
  return headers.get('x-real-ip') || headers.get('x-forwarded-for') || '';
};
