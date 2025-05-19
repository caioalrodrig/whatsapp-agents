import { Request, Response } from 'express';
import { WebhookService } from '../services/WebhookService.js';
import { pino } from 'pino';

export class WebhookController {
  private webhookService: WebhookService;
  private logger: pino.Logger;

  constructor() {
    this.webhookService = new WebhookService();
    this.logger = pino({ level: 'debug' });
  }

  public async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      await this.webhookService.handleWebhook(req, res);
    } catch (error) {
      this.logger.error({ error }, 'Erro ao processar webhook');
    }
  }
} 