'use server';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

import { ipToName } from './lib/dns';
import redis from './lib/redis';

// redis actions
export const flushRedis = async () => {
  console.debug(Date.now(), 'flushRedis');
  try {
    await redis.flushall();
    revalidatePath('/');
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
};

// status actions
export const fetchStatusesFromRedis = async () => {
  console.debug(Date.now(), 'fetchStatusesFromRedis');
  try {
    const statuses = await redis.hgetall('statuses');
    revalidatePath('/');
    return statuses;
  } catch (error) {
    console.error('Failed to fetch statuses:', error);
    // Consider appropriate error handling, such as retry logic or responding with an error message.
    return {};
  }
};

export const fetchNameAndStatuses = async () => {
  console.debug(Date.now(), 'fetchNameAndStatuses');
  try {
    const name = await ipToName();
    const statuses = await fetchStatusesFromRedis();
    return { statuses, name };
  } catch (error) {
    console.error('Failed to fetch name and statuses:', error);
    return { statuses: {}, name: '' };
  }
};

export const updateStatus = async (status: string) => {
  console.debug(Date.now(), 'updateStatus', status);
  try {
    const name = await ipToName();
    await redis.hset('statuses', name, status);
    revalidatePath('/'); // Adjust if specific paths need revalidation
  } catch (error) {
    console.error('Failed to update status:', error);
    // Consider appropriate error handling, such as retry logic or responding with an error message.
  }
};

// chat actions
export const sendMessage = async (content: string, sender?: string) => {
  const senderFromIp = await ipToName();
  const message = JSON.stringify({
    id: uuidv4(),
    sender: senderFromIp,
    content,
    timestamp: Date.now(),
  });
  console.log(Date.now(), { message, sender });

  // Using the timestamp as the score for sorted ordering.
  await redis.zadd('messages', Date.now(), message);

  // Set message expiry for 24 hours. Note: Redis does not support per-item TTL in sorted sets,
  // so we manage message expiry using a separate cleanup mechanism or using keys with TTL for each message.

  // Publish the message for real-time update.
  // await redis.publish('chat', message);
};

export const fetchRecentMessages = async () => {
  console.debug(Date.now(), 'fetchRecentMessages');
  // Fetch the last 15 messages based on score (timestamp).
  try {
    const rawMessages = await redis.zrange('messages', -15, -1);
    return rawMessages.map((msg) => JSON.parse(msg));
  } catch (error) {
    console.error('Failed to fetch recent messages:', error);
    return [];
  }
};
