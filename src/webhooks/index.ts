import { RequestHandler } from 'express';
import { pino } from 'pino';
import { createFlow } from '../service/agents/textAgent.js';
import { HumanMessage } from '@langchain/core/messages';
import { transcriptAudio } from '../shared/transcriptAudio.js';

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
    const message = req.body.base64
      ? await transcriptAudio(req.body.base64)
      : req.body.message;

    const response = await processMessage(message);

    logger.info({ response }, 'Mensagem processada com sucesso');
  } catch (error) {
    logger.error({ error }, 'Erro no webhook');
  }
};

export { webhook };
