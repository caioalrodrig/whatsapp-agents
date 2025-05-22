import { Logger } from '../core/config/Logger.js';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, MessageContent } from '@langchain/core/messages';
import { MessagesAnnotation } from '@langchain/langgraph';

export abstract class Agent {
  protected readonly logger: ReturnType<typeof Logger.getInstance>;
  protected model: BaseChatModel;

  constructor(model: BaseChatModel) {
    this.logger = Logger.getInstance();
    this.model = model;
  }

  protected abstract createFlow(): any;

  protected async processModelMessage(state: typeof MessagesAnnotation.State) {
    try {
      const response = await this.model.invoke(state.messages);
      return { messages: [response] };
    } catch (error) {
      this.logger.getLogger().error({ error }, 'Erro ao processar mensagem do modelo');
      throw error;
    }
  }
} 