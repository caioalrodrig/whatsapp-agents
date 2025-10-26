import { Request, Response, NextFunction } from 'express';
import { MessageData } from '../../core/models/MessageData.js';
import { BaseFilter } from './BaseFilter.js';

export class FormatInputFilter extends BaseFilter {
  public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { body } = req;
    
    const filteredData: MessageData = {
      fromMe: body.data.key.fromMe,
      phoneNumber: body.data.key.remoteJid,
      sender: body.data.pushName,
      conversation: body.data.message.conversation ?? undefined,
      base64: body.data.message.audioMessage
        ? body.data.message.base64
        : undefined,
      timestamp: new Date()
    };

    req.body = filteredData;
    next();
  }
} 