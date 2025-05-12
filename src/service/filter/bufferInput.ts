import { RequestHandler } from 'express';
import { MessageData } from '../../types/MessageData.js';
import { sendWhatsAppPresence } from '../WhatsApp/sendPresence.js';
import {
  isBufferComplete,
  getBufferedMessage,
  addMessage,
  setBufferComplete,
} from '../../shared/handleInputBuffer.js';
import { pino } from 'pino';

const logger = pino({ level: 'debug' });

const BUFFER_TIMEOUT = 6000;

export const bufferInput: RequestHandler = async (req, res, next) => {
  try {
    const inputMessage: MessageData = req.body;

    await sendWhatsAppPresence(inputMessage, 180);

    const messageCount = await addMessage(inputMessage);

    setTimeout(async () => {
      if (await isBufferComplete(inputMessage.phoneNumber, messageCount!)) {
        const bufferedMessage = await getBufferedMessage(
          inputMessage.phoneNumber,
        );

        if (bufferedMessage) {
          setBufferComplete(inputMessage.phoneNumber);
          req.body.conversation = bufferedMessage;
          next();
        }
      }
      res.end();
    }, BUFFER_TIMEOUT);
  } catch (error) {
    logger.error({ error }, 'Erro no buffer de mensagens');
    next(error);
  }
};
