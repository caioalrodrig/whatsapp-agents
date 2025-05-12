import dotenv from 'dotenv';
import { pino } from 'pino';
import { server } from './src/server.js';
import { redisClient } from './src/shared/config/redis.js';

dotenv.config();

const port = Number(process.env.PORT) || 3000;
const logger = pino({ level: 'debug' });

const startServer = () => {
  server.listen(port, () => {
    logger.info(`Servidor rodando em http://localhost:${port}`);
  });
};

redisClient.on('connect', () => {
  logger.info('Redis conectado com sucesso');
  startServer();
});

redisClient.on('error', (err) => {
  logger.error('Erro ao conectar com Redis:', err);
});

