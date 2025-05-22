import { Request, Response } from 'express';
import { Logger } from '../core/config/Logger.js';
import { MessageData } from '../models/MessageData.js';
import { MessageService } from './WhatsApp/MessageService.js';
import { MainAgent } from '../ai-agents/MainAgent.js';
import { HumanMessage, MessageContent } from '@langchain/core/messages';
import { AudioTranscript } from '../shared/AudioTranscript.js';

export class WebhookService {
  private logger: ReturnType<typeof Logger.getInstance>;
  private messageService: MessageService;
  private mainAgent: MainAgent;
  private audioTranscript: AudioTranscript;

  constructor() {
    this.logger = Logger.getInstance();
    this.messageService = new MessageService();
    this.mainAgent = MainAgent.getInstance();
    this.audioTranscript = new AudioTranscript();
  }

  private async callAIAgent(message: string): Promise<MessageContent> {
    try {
      const flow = this.mainAgent.createFlow();
      const output = await flow.compile().invoke({
        messages: [new HumanMessage(message)],
      });

      const lastMessage = output.messages?.[output.messages.length - 1];
      return lastMessage?.content;
    } catch (error) {
      this.logger.getLogger().error({ error }, 'Erro ao processar mensagem');
      throw error;
    }
  }

  public async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const inputData: MessageData = req.body;
      const message = inputData.base64
        ? await this.audioTranscript.transcript(inputData.base64)
        : inputData.conversation;

      const response = await this.callAIAgent(message);
      
      if (response) {
        await this.messageService.sendMessage(inputData, response.toString());
      }

      this.logger.getLogger().info({ response }, 'Fluxo completo');
    } catch (error) {
      this.logger.getLogger().error({ error }, 'Erro no webhook');
    }
  }
} 