import dns from 'dns/promises';
import { headers as requestHeaders } from 'next/headers';

export const ipToName = async () => {
  const ip = getIpFromHeaders();
  const name = await resolveIpToName(ip);
  return name;
};

export const getIpFromHeaders = () => {
  const headers = requestHeaders();
  return (
    headers.get('x-real-ip') || headers.get('x-forwarded-for') || 'unknown'
  );
};

export const resolveIpToName = async (ip: string) => {
  try {
    if (isPrivateIp(ip)) {
      // Handle private IP addresses differently if needed
      const hostnames = await dns.reverse(ip);
      return hostnames[0]; // Assuming the first hostname is the desired one
    }
    throw new Error('Not a private IP');
  } catch (error) {
    console.error('DNS resolution error:', error);
    return 'Unknown Host';
  }
};

const isPrivateIp = (ip: string) => {
  if (ip.startsWith('::1')) return true;
  if (ip.startsWith('127')) return true;
  if (ip.startsWith('100.64')) return true;
  if (ip.startsWith('10')) return true;
  return false;
};
