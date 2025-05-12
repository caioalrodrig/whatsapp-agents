import Redis from 'ioredis';
import { pino } from 'pino';

const logger = pino({ level: 'debug' });

const redisClient = new Redis({
  port: 6380,
  host: 'host.docker.internal',
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    const delay = Math.min(times * 500, 5000);
    logger.info(`Tentando reconectar ao Redis. Tentativa ${times}`);
    return delay;
  },

});

export { redisClient };
