import { MessageData } from '../types/MessageData';
import { redisClient } from './config/redis';
import { pino } from 'pino';

const logger = pino({ level: 'debug' });

export const addToContextDb = async (message: MessageData): Promise<void> => {
  try {
    const key = `context:${message.phoneNumber}:${Date.now()}`;
    
    await redisClient.setex(
      key,
      1200, 
      JSON.stringify(message)
    );

    await redisClient.lpush(`contexts:${message.phoneNumber}`, key);
    
    await redisClient.ltrim(`contexts:${message.phoneNumber}`, 0, 49);

    logger.info({ key }, 'Contexto salvo no Redis com sucesso');
  } catch (error) {
    logger.error({ error }, 'Erro ao salvar contexto no Redis');
    throw error;
  }
};

export const getContextFromDb = async (phoneNumber: string): Promise<MessageData[]> => {
  try {
    // Pegando as últimas 10 chaves de contexto do usuário
    const contextKeys = await redisClient.lrange(`contexts:${phoneNumber}`, 0, 9);
    
    // Recuperando os valores de todas as chaves
    const contextPromises = contextKeys.map((key: string) => redisClient.get(key));
    const contextValues = await Promise.all(contextPromises);
    
    // Filtrando valores nulos e convertendo strings JSON em objetos
    const contexts = contextValues
      .filter((value: string | null): value is string => value !== null)
      .map((value: string) => JSON.parse(value));

    return contexts;
  } catch (error) {
    logger.error({ error }, 'Erro ao recuperar contexto do Redis');
    throw error;
  }
};