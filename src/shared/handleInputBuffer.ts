import { redisClient } from './config/redis';
import { pino } from 'pino';
import { MessageData } from '../types/MessageData';

const logger = pino({ level: 'debug' });

const redisKeysWrapper = (phoneNumber: string) => ({
  messages: `buffer:${phoneNumber}:messages`,
  status: `buffer:${phoneNumber}:status`,
});

export const setBufferComplete = async (phoneNumber: string) => {
  const keys = redisKeysWrapper(phoneNumber);

  await redisClient.del(keys.messages);
  await redisClient.del(keys.status);
};

export const addMessage = async (
  inputMessage: MessageData,
): Promise<number | null> => {
  if (!inputMessage.phoneNumber) return null;

  const keys = redisKeysWrapper(inputMessage.phoneNumber);

  await redisClient.set(keys.status, 'processing');
  await redisClient.rpush(keys.messages, inputMessage.conversation);

  return await redisClient.llen(keys.messages);
};

export const getBufferedMessage = async (
  phoneNumber: string,
): Promise<string | null> => {
  const keys = redisKeysWrapper(phoneNumber);
  const status = await redisClient.get(keys.status);

  if (status !== 'completed') return null;

  const messages = await redisClient.lrange(keys.messages, 0, -1);

  return messages.length > 0 ? messages.join(' ') : null;
};

export const isBufferComplete = async (
  phoneNumber: string,
  msgCount: number,
): Promise<boolean | undefined> => {
  try {
    const keys = redisKeysWrapper(phoneNumber);

    if ((await redisClient.llen(keys.messages)) === msgCount) {
      await redisClient.set(keys.status, 'completed');
      return true;
    }

    return false;
  } catch (error) {
    logger.error(
      { error, phoneNumber: phoneNumber },
      'Erro ao processar buffer',
    );
  }
};
