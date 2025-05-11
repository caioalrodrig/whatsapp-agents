import { RequestHandler } from 'express';
import { pino } from 'pino';
import { createFlow } from '../service/agents/textAgent.js';
import { HumanMessage } from '@langchain/core/messages';
import { transcriptAudio } from '../shared/transcriptAudio.js';
import { sendWhatsAppMessage } from '../service/WhatsApp/sendMessage.js';
import { MessageData } from '../types/MessageData.js';

const logger = pino({ level: 'debug' });

const processMessage = async (message: string) => {
  try {
    const flow = createFlow();

    const output = await flow.compile().invoke({
      messages: [new HumanMessage(message)],
    });

    const lastMessage = output.messages?.[output.messages.length - 1];

    return lastMessage?.content;
  } catch (error) {
    logger.error({ error }, 'Erro ao processar mensagem');
    throw error;
  }
};

const webhook: RequestHandler = async (req, res) => {
  try {
    const inputData: MessageData = req.body;
    const message = inputData.base64
      ? await transcriptAudio(inputData.base64)
      : inputData.conversation;

    const response = await processMessage(message).then(async (response) => {
      if (response) {
        await sendWhatsAppMessage(inputData, response as string);
      }
    }).catch((error) => {
      logger.error({ error }, 'Erro ao processar mensagem');
      throw error;
    });

    logger.info({ response }, 'Fluxo completo');
  } catch (error) {
    logger.error({ error }, 'Erro no webhook');
  }
};

export { webhook };
