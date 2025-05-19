import { Request, Response, NextFunction } from 'express';
import { BaseFilter } from './BaseFilter.js';
import { Environment } from '../../core/config/Environment.js';

export class InputFilter extends BaseFilter {
  private env: ReturnType<typeof Environment.getInstance>;
  private readonly ALLOWED_NUMBER: string;

  constructor() {
    super();
    this.env = Environment.getInstance();
    this.ALLOWED_NUMBER = process.env.SENDER_ID ?? '';
  }

  public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (String(req.body.phoneNumber).includes(String(this.ALLOWED_NUMBER))) {
      res.status(200);
      this.logger.getLogger().info({ body: req.body, method: req.method }, 'Webhook recebido');
      next();
      return;
    }

    this.logger.getLogger().info('Webhook não autorizado');
    res.status(200).end();
  }
} 