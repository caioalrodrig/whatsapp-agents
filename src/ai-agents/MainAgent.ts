import { ChatGroq } from '@langchain/groq';
import { MessagesAnnotation, START, END, StateGraph } from '@langchain/langgraph';
import { Agent } from './Agent.js';

export class MainAgent extends Agent {
  private static instance: MainAgent;

  private constructor() {
    super(new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      maxRetries: 2,
      temperature: 0,
    }));
  }

  public static getInstance(): MainAgent {
    if (!MainAgent.instance) {
      MainAgent.instance = new MainAgent();
    }
    return MainAgent.instance;
  }

  public createFlow() {
    return new StateGraph(MessagesAnnotation)
      .addNode('model', this.processModelMessage.bind(this))
      .addEdge(START, 'model')
      .addEdge('model', END);
  }
} 