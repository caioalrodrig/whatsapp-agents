import { RequestHandler } from 'express';
import { MessageData } from '../../types/MessageData.js';

export const formatInputData: RequestHandler = (req, res, next) => {
  try {
    const { body } = req;

    const filteredData: MessageData = {
      phoneNumber: body.data.key.remoteJid.split('@')[0],
      sender: body.data.pushName,
      conversation: body.data.message.conversation ?? undefined,
      base64: body.data.message.audioMessage
        ? body.data.message.base64
        : undefined,
      dateTime: new Date(),
    };

    req.body = filteredData;
    next();
  } catch (error) {
    next(error);
  }
};
