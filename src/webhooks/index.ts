import { RequestHandler } from 'express';
import { pino } from 'pino';
import { createFlow } from '../service/agents/index.js';
import { HumanMessage } from '@langchain/core/messages';

const logger = pino({ level: 'debug' });

const processMessage = async (message: string) => {
  try {
    const flow = createFlow();
    const compiledApp = flow.compile();

     const output = await compiledApp.invoke({
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
    const message = req.body?.data?.message.conversation;

    const response = await processMessage(message); 

    logger.info({ response }, 'Mensagem processada com sucesso'); 

  } catch (error) {
    logger.error({ error }, 'Erro no webhook');
  }
};

export { webhook };
