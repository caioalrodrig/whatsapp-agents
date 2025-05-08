import dotenv from 'dotenv';
import { pino } from 'pino';
import { server } from './src/server.js';

dotenv.config();

const port = Number(process.env.PORT) || 3000;

const logger = pino({ level: 'debug' });


server.listen(port, () => {
  logger.info(`Servidor rodando em http://localhost:${port}`);
});

