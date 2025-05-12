import 'dotenv/config';
import { RequestHandler } from 'express';
import { pino } from 'pino';

const logger = pino({ level: 'debug' });

const ALLOWED_NUMBER = process.env.SENDER_ID;

export const filterInputData: RequestHandler = async (req, res, next) => {
  try {
    if (String(req.body.phoneNumber).includes(String(ALLOWED_NUMBER))) {
      res.status(200);
      logger.info({ body: req.body, method: req.method }, 'Webhook recebido');
      next();
    }

    logger.info('Webhook não autorizado');

    res.status(200).end();
  } catch (error) {
    logger.error({ error }, 'Erro no webhook');
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
