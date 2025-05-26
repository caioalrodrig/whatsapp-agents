import { Request, Response, NextFunction } from 'express';
import { MessageData } from '../../core/models/MessageData.js';
import { BaseFilter } from './BaseFilter.js';
import { PresenceService } from '../WhatsApp/PresenceService.js';
import { RedisClient } from '../../core/RedisClient.js';

export class BufferInputFilter extends BaseFilter {
  private presenceService: PresenceService;
  private readonly BUFFER_TIMEOUT = 6000;
  private redisClient: RedisClient;

  constructor() {
    super();
    this.presenceService = new PresenceService();
    this.redisClient = RedisClient.getInstance();
  }

  private redisKeysWrapper(phoneNumber: string) {
    return {
      messages: `buffer:${phoneNumber}:messages`,
      status: `buffer:${phoneNumber}:status`,
    };
  }

  private async setBufferComplete(phoneNumber: string): Promise<void> {
    const keys = this.redisKeysWrapper(phoneNumber);
    await this.redisClient.del(keys.messages);
    await this.redisClient.del(keys.status);
  }

  private async addMessage(inputMessage: MessageData): Promise<number | null> {
    if (!inputMessage.phoneNumber) return null;

    const keys = this.redisKeysWrapper(inputMessage.phoneNumber);

    await this.redisClient.set(keys.status, 'processing');
    await this.redisClient.rpush(keys.messages, inputMessage.conversation);

    return await this.redisClient.llen(keys.messages);
  }

  private async getBufferedMessage(phoneNumber: string): Promise<string | null> {
    const keys = this.redisKeysWrapper(phoneNumber);
    const status = await this.redisClient.get(keys.status);

    if (status !== 'completed') return null;

    const messages = await this.redisClient.lrange(keys.messages, 0, -1);

    return messages.length > 0 ? messages.join(' ') : null;
  }

  private async isBufferComplete(phoneNumber: string, msgCount: number): Promise<boolean | undefined> {
    try {
      const keys = this.redisKeysWrapper(phoneNumber);

      if ((await this.redisClient.llen(keys.messages)) === msgCount) {
        await this.redisClient.set(keys.status, 'completed');
        return true;
      }

      return false;
    } catch (error) {
      this.logger.getLogger().error(
        { error, phoneNumber },
        'Erro ao processar buffer',
      );
    }
  }

  public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const inputMessage: MessageData = req.body;

    await this.presenceService.sendPresence(inputMessage, this.BUFFER_TIMEOUT);

    const messageCount = await this.addMessage(inputMessage);

    setTimeout(async () => {
      if (await this.isBufferComplete(inputMessage.phoneNumber, messageCount!)) {
        const bufferedMessage = await this.getBufferedMessage(inputMessage.phoneNumber);

        if (bufferedMessage) {
          await this.setBufferComplete(inputMessage.phoneNumber);
          req.body.conversation = bufferedMessage;
          next();
        }
      }
      res.end();
    }, this.BUFFER_TIMEOUT);
  }
} 