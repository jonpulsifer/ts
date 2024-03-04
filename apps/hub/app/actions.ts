'use server';
import { revalidatePath } from 'next/cache';

import { ipToName } from './lib/dns';
import redis from './lib/redis';

export const getStatusesFromRedis = async () => {
  const statuses = await redis.hgetall('statuses');
  console.log('Fetched statuses from Redis');
  console.log(statuses);
  revalidatePath(`/`, 'layout');
  return statuses;
};

export const getInitialProps = async () => {
  const name = await ipToName();
  const statuses = await getStatusesFromRedis();
  return { statuses, name };
};

export const updateStatus = async (busy: string) => {
  const name = await ipToName();
  await redis.hset('statuses', name, busy);
  console.log(`Updated busy status for ${name} to ${busy}`);
  revalidatePath(`/`, 'layout');
  return name;
};
