import type { RedisOptions } from 'ioredis';
import Redis from 'ioredis';

const url = process.env.REDIS_URL || 'redis://localhost:6379/0';

const options: RedisOptions = {
  lazyConnect: true,
  showFriendlyErrorStack: true,
  enableAutoPipelining: true,
  maxRetriesPerRequest: 0,
  retryStrategy: (times: number) => {
    if (times > 50) {
      throw new Error(`[Redis] Could not connect after ${times} attempts`);
    }

    return Math.min(times * 200, 100000);
  },
};

const redis = new Redis(url, options);

redis.on('error', (error: unknown) => {
  console.warn('[Redis] Error connecting', error);
});

export default redis;
