import 'dotenv/config';
import { RequestHandler } from 'express';
import { pino } from 'pino';

const logger = pino({ level: 'debug' });

const ALLOWED_NUMBER = process.env.SENDER_ID;

if (!ALLOWED_NUMBER) {
  throw new Error('SENDER_ID environment variable is not defined');
}

export const filterInputData: RequestHandler = async (req, res, next) => {
  try {
    res.status(200);

    const msgPhoneNumber = req.body.phoneNumber;

    if (String(msgPhoneNumber).includes(String(ALLOWED_NUMBER))) {
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
