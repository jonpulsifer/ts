import type { RedisOptions } from 'ioredis';
import Redis from 'ioredis';

const url = process.env.REDIS_URL || 'redis://localhost:6379/0';

const options: RedisOptions = {
  lazyConnect: true, // This will not connect until the first command is issued
  showFriendlyErrorStack: true,
  enableAutoPipelining: true,
  maxRetriesPerRequest: 0, // Set to null for unlimited retry attempts per request
  retryStrategy: (times: number) => {
    // This function defines the strategy for retrying connection attempts

    // You can adjust the logic here for how long you wait between retries
    // For example, this increases the delay with each attempt, up to a maximum of 100 seconds
    return Math.min(times * 200, 100000); // waits between retries, caps at 100 seconds
  },
};

const redis = new Redis(url, options);

redis.on('error', (error: unknown) => {
  console.warn('[Redis] Error connecting:', error);
  // Optionally, you could implement additional logic here to handle prolonged disconnection scenarios
});

// Attempt to connect
redis.connect().catch((error) => {
  console.error('Failed to connect to redis:', error);
});

export default redis;
