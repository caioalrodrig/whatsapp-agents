import { Request, Response, NextFunction } from 'express';
import { MessageData } from '../../models/MessageData.js';
import { BaseFilter } from './BaseFilter.js';
import { PresenceService } from '../WhatsApp/PresenceService.js';
import {
  isBufferComplete,
  getBufferedMessage,
  addMessage,
  setBufferComplete
} from '../../shared/handleInputBuffer.js';

export class BufferInputFilter extends BaseFilter {
  private presenceService: PresenceService;
  private readonly BUFFER_TIMEOUT = 6000;

  constructor() {
    super();
    this.presenceService = new PresenceService();
  }

  public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const inputMessage: MessageData = req.body;

    await this.presenceService.sendPresence(inputMessage, this.BUFFER_TIMEOUT);

    const messageCount = await addMessage(inputMessage);

    setTimeout(async () => {
      if (await isBufferComplete(inputMessage.phoneNumber, messageCount!)) {
        const bufferedMessage = await getBufferedMessage(inputMessage.phoneNumber);

        if (bufferedMessage) {
          setBufferComplete(inputMessage.phoneNumber);
          req.body.conversation = bufferedMessage;
          next();
        }
      }
      res.end();
    }, this.BUFFER_TIMEOUT);
  }
} 