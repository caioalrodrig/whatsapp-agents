import express from 'express'; 
import cors from 'cors';
import { router } from './routes/index.js';
import { pino } from 'pino';

const logger = pino({ level: 'debug' });
const server = express();

server.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

server.use(express.json({ limit: '10mb' }));
server.use(express.urlencoded({ extended: true, limit: '10mb' }));

server.use(router);

server.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ error: err }, 'Erro no servidor');
  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
});

export { server }