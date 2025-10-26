import { Router as ExpressRouter } from 'express';
import express from 'express';
import cors from 'cors';
import { WebhookController } from './WebhookController.js';
import { WebhookService } from '@/services/WebhookService.js';
import { BufferInputFilter } from '@/services/filter/BufferInputFilter.js';
import { InputFilter } from '@/services/filter/InputFilter.js';
import { FormatInputFilter } from '@/services/filter/FormatInputFilter.js';

export class Router {
  private router: ExpressRouter;
  private webhookController: WebhookController;
  private formatInputFilter = new FormatInputFilter();
  private inputFilter = new InputFilter();
  private bufferInputFilter = new BufferInputFilter();
  private webhookService = new WebhookService();

  constructor() {
    this.router = ExpressRouter();
    this.webhookController = new WebhookController();
    this.formatInputFilter = new FormatInputFilter();
    this.inputFilter = new InputFilter();
    this.bufferInputFilter = new BufferInputFilter();
    this.webhookService = new WebhookService();
    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware(): void {
    this.router.use(cors());
    this.router.use(express.json());
  }

  private configureRoutes(): void {
    this.router.post(
      '/webhook/evolution',
      (req, res, next) => this.formatInputFilter.execute(req, res, next),
      (req, res, next) => this.inputFilter.execute(req, res, next),
      (req, res, next) => this.bufferInputFilter.execute(req, res, next),
      (req, res) => this.webhookController.handleWebhook(req, res)
    );

    this.router.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
  }

  public getRouter(): ExpressRouter {
    return this.router;
  }
}
