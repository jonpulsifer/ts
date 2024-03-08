'use server';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

import type { Message } from './components/chat';
import type { Status } from './components/status';
import { ipToName } from './lib/dns';
import redis from './lib/redis';

// redis actions
export const flushRedis = async () => {
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
    // turn the object into an array of objects
    return Object.entries(statuses).map(([name, status]) => ({
      name,
      status,
    })) as Status[];
    // return Object.values(statuses).map((status) => JSON.parse(status));
  } catch (error) {
    console.error('Failed to fetch statuses:', error);
    // Consider appropriate error handling, such as retry logic or responding with an error message.
    return [];
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
    return { statuses: [], name: '' };
  }
};

export const updateStatus = async (status: string) => {
  if (!status) {
    throw new Error('Status is required');
  }
  console.debug(Date.now(), 'updateStatus', status);
  try {
    const name = await ipToName();
    await redis.hset('statuses', name, status);
  } catch (error) {
    console.error('Failed to update status:', error);
    // Consider appropriate error handling, such as retry logic or responding with an error message.
  } finally {
    revalidatePath('/');
  }
};

// chat actions
export const sendMessage = async (formData: FormData) => {
  const senderFromIp = await ipToName();
  try {
    const content = formData.get('messageButton' as string);
    if (!content) {
      throw new Error('Message content is required');
    }
    const message = {
      id: uuidv4(),
      sender: senderFromIp,
      content: content,
      timestamp: Date.now(),
    };
    // Using the timestamp as the score for sorted ordering.
    await redis.zadd('messages', Date.now(), JSON.stringify(message));

    // Set message expiry for 24 hours. Note: Redis does not support per-item TTL in sorted sets,
    // so we manage message expiry using a separate cleanup mechanism or using keys with TTL for each message.

    // Publish the message for real-time update.
    // await redis.publish('chat', message);
  } catch (error) {
    console.error('Failed to send message:', error);
    return { error: 'Failed to send message' };
  } finally {
    revalidatePath('/');
  }
};

export const fetchRecentMessages = async () => {
  try {
    const rawMessages = await redis.zrange('messages', -15, -1);
    const messagesFromJSON = rawMessages.map((msg) =>
      JSON.parse(msg),
    ) as Message[];
    return messagesFromJSON;
  } catch (error) {
    console.error('Failed to fetch recent messages:', error);
    return [];
  }
};
