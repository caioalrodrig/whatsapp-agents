import { Request, Response, NextFunction } from 'express';
import { Logger } from '../../core/config/Logger.js';

export abstract class BaseFilter {
  protected logger: ReturnType<typeof Logger.getInstance>;

  constructor() {
    this.logger = Logger.getInstance();
  }

  abstract handle(req: Request, res: Response, next: NextFunction): Promise<void>;

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.handle(req, res, next);
    } catch (error) {
      this.logger.getLogger().error({ error }, 'Erro no filtro');
      next(error);
    }
  }
} 