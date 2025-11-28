import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Router } from './core/Router.js';
import { Logger } from './core/config/Logger.js';

export class Server {
  private app: Express;
  private logger: ReturnType<typeof Logger.getInstance>;
  private router: Router;

  constructor() {
    this.app = express();
    this.logger = Logger.getInstance();
    this.router = new Router();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    this.app.use(
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private configureRoutes(): void {
    this.app.use(this.router.getRouter());
  }

  private configureErrorHandling(): void {
    this.app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        this.logger.getLogger().error({ err }, 'Erro no servidor');
        res.status(500).json({
          status: 'error',
          message: 'Erro interno do servidor',
        });
      },
    );
  }

  public getApp(): Express {
    return this.app;
  }

  public listen(port: number, callback?: () => void): void {
    this.app.listen(port, callback);
  }
}
