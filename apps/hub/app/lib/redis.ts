import Redis from 'ioredis';

const url = process.env.REDIS_URL || 'redis://localhost:6379/0';

const redis = new Redis(url);

export default redis;
