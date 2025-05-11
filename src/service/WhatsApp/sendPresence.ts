import 'dotenv/config';
import fetch from 'node-fetch';
import { pino } from 'pino';
import { MessageData } from '../../types/MessageData.js';

const logger = pino({ level: 'debug' });

const TYPING_DELAY = 3000;
const API_KEY = process.env.EVO_API_KEY ?? '';
const SEND_PRESENCE_URL = `
${process.env.EVO_SERVER_URL}/chat/presence/${process.env.EVO_API_INSTANCE}
`;

const sendWhatsAppPresence = async (
  messageData: MessageData,
  delay: number = TYPING_DELAY,
) => {
  try {
    const options = {
      method: 'POST',
      headers: { apikey: API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: messageData.phoneNumber,
        options: { delay: delay, presence: 'composing' },
      }),
    };

    fetch(SEND_PRESENCE_URL, options)
      .then((response) => response.json())
      .then((response) => console.log(response))
      .catch((err) => console.error(err));
  } catch (error) {
    logger.error({ error }, 'Erro no webhook');
  }
};

export { sendWhatsAppPresence };
