import dns from 'dns/promises';
import { headers as requestHeaders } from 'next/headers';

export const ipToName = async () => {
  const ip = getIpFromHeaders();
  const name = await resolveIpToName(ip);
  const lowerCaseName = name.toLowerCase();

  if (process.env.NODE_ENV === 'development') {
    return 'Development';
  }

  switch (true) {
    case lowerCaseName.includes('screenpi4'):
    case lowerCaseName.includes('atomic'):
    case lowerCaseName.includes('ts4'):
    case lowerCaseName.includes('tinytower'):
    case lowerCaseName === '10.2.0.28':
      return 'Laboratory';
    case lowerCaseName.includes('homepi4'):
    case lowerCaseName.includes('10.2.0.23'):
    case lowerCaseName === 'caldigit':
      return 'Studio';
    case undefined:
      return 'Unknown Host: ' + ip;
    default:
      return name;
  }
};

export const getIpFromHeaders = () => {
  const headers = requestHeaders();
  return headers.get('x-real-ip') || headers.get('x-forwarded-for') || '';
};

export const resolveIpToName = async (ip: string) => {
  try {
    dns.setServers(['10.2.0.1']); // Use Cloudflare DNS for resolution
    // Handle private IP addresses differently if needed
    const hostnames = await dns.reverse(ip);
    return hostnames[0]; // Assuming the first hostname is the desired one
  } catch (error) {
    console.error('DNS resolution error:', error);
    return ip;
  }
};
