import { Redis } from 'ioredis';
import { Logger } from './config/Logger.js';

export class RedisClient {
  private static instance: RedisClient;
  public client: Redis;
  private logger: ReturnType<typeof Logger.getInstance>;

  private constructor() {
    this.logger = Logger.getInstance();
    this.client = new Redis({
      port: 6380,
      host:
        process.env.NODE_ENV === 'production'
          ? 'redis_app'
          : 'host.docker.internal',
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        const delay = Math.min(times * 500, 5000);
        this.logger
          .getLogger()
          .info(`Tentando reconectar ao Redis. Tentativa ${times}`);
        return delay;
      },
    });

    this.client.on('error', (err: Error) => {
      this.logger
        .getLogger()
        .error({ error: err }, 'Erro na conexão com Redis');
    });

    this.client.on('connect', () => {
      this.logger.getLogger().info('Conectado ao Redis com sucesso');
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.ping();
    } catch (error) {
      this.logger.getLogger().error({ error }, 'Erro ao conectar ao Redis');
      throw error;
    }
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger
        .getLogger()
        .error({ error }, 'Erro ao definir valor no Redis');
      throw error;
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.getLogger().error({ error }, 'Erro ao obter valor do Redis');
      throw error;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger
        .getLogger()
        .error({ error }, 'Erro ao deletar chave do Redis');
      throw error;
    }
  }

  public async quit(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      this.logger
        .getLogger()
        .error({ error }, 'Erro ao fechar conexão com Redis');
      throw error;
    }
  }

  public async rpush(key: string, value: string): Promise<number> {
    try {
      return await this.client.rpush(key, value);
    } catch (error) {
      this.logger
        .getLogger()
        .error({ error }, 'Erro ao adicionar valor à lista no Redis');
      throw error;
    }
  }

  public async llen(key: string): Promise<number> {
    try {
      return await this.client.llen(key);
    } catch (error) {
      this.logger
        .getLogger()
        .error({ error }, 'Erro ao obter tamanho da lista no Redis');
      throw error;
    }
  }

  public async lrange(
    key: string,
    start: number,
    stop: number,
  ): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error) {
      this.logger
        .getLogger()
        .error({ error }, 'Erro ao obter valores da lista no Redis');
      throw error;
    }
  }
}
