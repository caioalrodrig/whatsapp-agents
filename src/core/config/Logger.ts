import { pino } from 'pino';

export class Logger {
  private static instance: Logger;
  private logger: pino.Logger;

  private constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info'
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public getLogger(): pino.Logger {
    return this.logger;
  }
} 