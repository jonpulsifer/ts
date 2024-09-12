import { v4 as uuidv4 } from 'uuid';

import redis from '../../lib/redis';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  const message = {
    id: uuidv4(),
    sender: 'API',
    content: `Hello, world! Number:${Math.random()}`,
    timestamp: Date.now(),
  };
  // Using the timestamp as the score for sorted ordering.
  await redis.zadd('messages', Date.now(), JSON.stringify(message));
  return Response.json({ pong: 'pong' });
}
