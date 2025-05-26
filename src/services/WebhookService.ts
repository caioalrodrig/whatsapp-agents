import { Request, Response } from 'express';
import { Logger } from '../core/config/Logger.js';
import { MessageData } from '../core/models/MessageData.js';
import { MessageService } from './WhatsApp/MessageService.js';
import { MainAgent } from '../ai-agents/MainAgent.js';
import { HumanMessage, MessageContent } from '@langchain/core/messages';
import { AudioTranscript } from './shared/AudioTranscript.js';

export class WebhookService {
  private logger: ReturnType<typeof Logger.getInstance>;
  private messageService: MessageService;
  private audioTranscript: AudioTranscript;

  constructor() {
    this.logger = Logger.getInstance();
    this.messageService = new MessageService();
    this.audioTranscript = new AudioTranscript();
  }

  private async callAIAgent(inputData: MessageData): Promise<MessageContent> {
    try {
      const mainAgent = new MainAgent(inputData.phoneNumber);

      const message = await this.handleMessage(inputData);

      const output = await mainAgent.createFlow().invoke({
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

      const response = await this.callAIAgent(inputData);

      if (response) {
        await this.messageService.sendMessage(inputData, response.toString());
      }

      this.logger.getLogger().info(
        {
          response,
          threadId: inputData.phoneNumber,
        },
        'Fluxo completo',
      );
    } catch (error) {
      this.logger.getLogger().error({ error }, 'Erro no webhook');
    }
  }

  private async handleMessage(inputData: MessageData): Promise<string> {
    return inputData.base64
      ? await this.audioTranscript.transcript(inputData.base64)
      : inputData.conversation;
  }
}
