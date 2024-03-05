'use server';
import { revalidatePath } from 'next/cache';

import { ipToName } from './lib/dns';
import redis from './lib/redis';

export const getStatusesFromRedis = async () => {
  const statuses = await redis.hgetall('statuses');
  revalidatePath(`/`, 'layout');
  return statuses;
};

export const getInitialProps = async () => {
  const name = await ipToName();
  const statuses = await getStatusesFromRedis();
  return { statuses, name };
};

export const updateStatus = async (status: string) => {
  const name = await ipToName();
  await redis.hset('statuses', name, status);
  revalidatePath(`/`, 'layout');
  return name;
};
