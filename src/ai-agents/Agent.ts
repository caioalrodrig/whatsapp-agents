import { Logger } from '../core/config/Logger.js';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { MessagesAnnotation } from '@langchain/langgraph';

export abstract class Agent {
  protected readonly logger: ReturnType<typeof Logger.getInstance>;
  protected model: BaseChatModel;
  protected threadId: string;
  protected SYSTEM_TEMPLATE: string;
  protected templateVariables: Record<string, string>;

  constructor(
    model: BaseChatModel, 
    threadId: string, 
    systemTemplate: string,
    templateVariables: Record<string, string> = {}
  ) {
    this.logger = Logger.getInstance();
    this.model = model;
    this.threadId = threadId;
    this.SYSTEM_TEMPLATE = systemTemplate;
    this.templateVariables = templateVariables;
  }

  protected abstract createFlow(): any;

  private getPromptTemplate() {
    return ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(this.SYSTEM_TEMPLATE),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);
  }

  protected async processModelMessage(state: typeof MessagesAnnotation.State) {
    try {
      const formattedPrompt = await this.getPromptTemplate().formatMessages({
        history: state.messages.slice(0, -1),
        input: state.messages[state.messages.length - 1].content,
        ...this.templateVariables,
      });

      const response = await this.model.invoke(formattedPrompt);
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
