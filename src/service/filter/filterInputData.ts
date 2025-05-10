import 'dotenv/config';
import { RequestHandler } from 'express';
import { pino } from 'pino';

const logger = pino({ level: 'debug' });

const ALLOWED_SENDER = process.env.SENDER_ID;
const ALLOWED_SENDER_NAME = process.env.SENDRER_NAME;

if (!ALLOWED_SENDER) {
  throw new Error('SENDER_ID environment variable is not defined');
}

export const filterInputData: RequestHandler = async (req, res, next) => {
  try {
    res.status(200);

    const msgSender = req.body.sender;
    const msgSenderName = req.body.data.pushName;

    if (
      String(msgSender).includes(String(ALLOWED_SENDER)) &&
      String(msgSenderName).includes(String(ALLOWED_SENDER_NAME))
    ) {
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
