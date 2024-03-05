'use server';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

import { ipToName } from './lib/dns';
import redis from './lib/redis';

// status actions
export const fetchStatusesFromRedis = async () => {
  const statuses = await redis.hgetall('statuses');
  revalidatePath('/');
  return statuses;
};

export const fetchNameAndStatuses = async () => {
  const name = await ipToName();
  const statuses = await fetchStatusesFromRedis();
  return { statuses, name };
};

export const updateStatus = async (status: string) => {
  const name = await ipToName();
  await redis.hset('statuses', { name, status });
  revalidatePath('/');
  return name;
};

// chat actions
export const sendMessage = async (sender: string, content: string) => {
  const senderFromIp = await ipToName();
  const message = JSON.stringify({
    id: uuidv4(),
    sender: senderFromIp,
    content,
    timestamp: Date.now(),
  });

  // log an object with the message and the sender, include every detail
  console.log({ message, sender });

  // Using the timestamp as the score for sorted ordering.
  await redis.zadd('messages', Date.now(), message);

  // Set message expiry for 24 hours. Note: Redis does not support per-item TTL in sorted sets,
  // so we manage message expiry using a separate cleanup mechanism or using keys with TTL for each message.

  // Publish the message for real-time update.
  await redis.publish('chat', message);
};

export const fetchRecentMessages = async () => {
  // Fetch the last 15 messages based on score (timestamp).
  const rawMessages = await redis.zrange('messages', -15, -1);
  return rawMessages.map((msg) => JSON.parse(msg));
};
