import { MessageData } from '@/types/MessageData.js';
import 'dotenv/config';
import { pino } from 'pino';

const logger = pino({ level: 'debug' });

const API_KEY = process.env.EVO_API_KEY ?? '';
const SEND_MSG_URL = `
${process.env.EVO_SERVER_URL}/message/sendText/${process.env.EVO_API_INSTANCE}
`;

const sendWhatsAppMessage = async (
  messageData: MessageData,
  messageToSend: string,
) => {
  try {
    const options = {
      method: 'POST',
      headers: { apikey: API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: messageData.phoneNumber,
        text: messageToSend,
        delay: 3000,
      }),
    };

    fetch(SEND_MSG_URL, options)
      .then((response) => response.json())
      .then((response) => console.log(response))
      .catch((err) => console.error(err));
  } catch (error) {
    logger.error({ error }, 'Erro no webhook');
  }
};

export { sendWhatsAppMessage };
