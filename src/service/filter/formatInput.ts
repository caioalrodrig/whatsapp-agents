import { RequestHandler } from 'express';

interface MessageData {
  phoneNumber: string;
  sender: string;
  message: string;
  dateTime: Date;
};


export const formatInputData: RequestHandler = (req, res, next) => {
  try {
    const { body } = req;

    const filteredData: MessageData = {
      phoneNumber: body.data.key.remoteJid.split('@')[0], 
      sender: body.data.pushName,
      message: body.data.message.conversation,
      dateTime: new Date(), 
    };

    req.body = filteredData;
    next();
  } catch (error) {
    next(error);
  }
};
