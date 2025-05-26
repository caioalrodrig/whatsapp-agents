import { Logger } from '../core/config/Logger.js';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { MessagesAnnotation } from '@langchain/langgraph';

export abstract class Agent {
  protected readonly logger: ReturnType<typeof Logger.getInstance>;
  protected model: BaseChatModel;
  protected threadId: string;

  constructor(model: BaseChatModel, threadId: string) {
    this.logger = Logger.getInstance();
    this.model = model;
    this.threadId = threadId;
  }

  protected abstract createFlow(): any;

  protected async processModelMessage(state: typeof MessagesAnnotation.State) {
    try {
      const response = await this.model.invoke(state.messages);
      return { messages: [response] };
    } catch (error) {
      this.logger
        .getLogger()
        .error({ error }, 'Erro ao processar mensagem do modelo');
      throw error;
    }
  }

  protected getThreadId(): string {
    return this.threadId;
  }
}
