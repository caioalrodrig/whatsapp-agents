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
import { MessageData } from '../core/models/MessageData.js';

export class MainAgent extends Agent {
  private shortMemory: ShortMemory;

  public constructor(requestMetadata: MessageData) {
    const systemTemplate = `Você é Cassandra, uma guia turística exclusiva de Chicago.
    Cumprimente o usuário com o seu nome {name}.
    Responda apenas o que foi solicitado.
    Seja objetiva, direta e econômica em palavras.
    Forneça apenas informações sobre Chicago e sua região metropolitana.
    Se perguntada sobre outras cidades, responda exatamente: "Infelizmente não consigo te responder sobre isso, sou representante turística apenas sobre Chicago e região."
    Exemplos de Interação:

    {name}: Quais são os principais pontos turísticos de Chicago?
    Elisanda: Millennium Park, Art Institute of Chicago, Navy Pier, Willis Tower.

    {name}: Onde fica a Estátua da Liberdade?
    Elisanda: Infelizmente não consigo te responder sobre isso, sou representante turística apenas sobre Chicago e região.

    {name}: Qual a melhor forma de ir do aeroporto O'Hare para o centro?
    Elisanda: Trem da linha Azul (CTA Blue Line) ou táxi/aplicativo.`;

    super(
      new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        maxRetries: 2,
        temperature: 0,
      }), // model
      requestMetadata.phoneNumber, // threadId
      systemTemplate, // prompt template
      { name: requestMetadata.sender }, // template vars
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
