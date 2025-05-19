import { ChatGroq } from '@langchain/groq';
import { AIMessage } from '@langchain/core/messages';
import { MessagesAnnotation, START, END, StateGraph } from '@langchain/langgraph';
import { Logger } from '../core/config/Logger.js';

export class MainAgent {
  private static instance: MainAgent;
  private logger: ReturnType<typeof Logger.getInstance>;
  private model: ChatGroq;

  private constructor() {
    this.logger = Logger.getInstance();
    this.model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      maxRetries: 2,
      temperature: 0,
    });
  }

  public static getInstance(): MainAgent {
    if (!MainAgent.instance) {
      MainAgent.instance = new MainAgent();
    }
    return MainAgent.instance;
  }

  private async processMessage(state: typeof MessagesAnnotation.State) {
    try {
      const response = await this.model.invoke(state.messages);
      return { messages: [response] };
    } catch (error) {
      this.logger.getLogger().error({ error }, 'Erro ao processar mensagem');
      throw error;
    }
  }

  public createFlow() {
    return new StateGraph(MessagesAnnotation)
      .addNode('model', this.processMessage.bind(this))
      .addEdge(START, 'model')
      .addEdge('model', END);
  }
} 