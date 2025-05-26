import { ChatGroq } from '@langchain/groq';
import {
  MessagesAnnotation,
  START,
  END,
  StateGraph,
} from '@langchain/langgraph';
import { Agent } from './Agent.js';
import { ShortMemory } from './memory/ShortMemory.js';
import { RedisClient } from '../core/RedisClient.js';

export class MainAgent extends Agent {
  private shortMemory: ShortMemory;

  public constructor(threadId: string) {
    super(
      new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        maxRetries: 2,
        temperature: 0,
      }),
      threadId,
    );
    this.shortMemory = new ShortMemory({
      connection: RedisClient.getInstance().client,
    });
  }

  public createFlow() {
    const graph = new StateGraph(MessagesAnnotation)
      .addNode('model', this.processModelMessage.bind(this))
      .addEdge(START, 'model')
      .addEdge('model', END);

    const compiled = graph.compile({
      checkpointer: this.shortMemory,
    });

    return {
      invoke: async (input: any) => {
        return compiled.invoke(input, {
          configurable: {
            thread_id: this.getThreadId(),
          },
        });
      },
    };
  }
}
