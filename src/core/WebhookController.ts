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
      this.logger.info({ body: req.body }, 'Webhook recebido');
      await this.webhookService.handleWebhook(req, res);
    } catch (err) {
      this.logger.error({ err }, 'Erro ao processar webhook');
    }
  }
} 