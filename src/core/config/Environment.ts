export class Environment {
  private static instance: Environment;
  
  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }
    return Environment.instance;
  }

  public getPort(): number {
    return parseInt(process.env.PORT || '3000', 10);
  }

  public getRedisUrl(): string {
    return process.env.REDIS_URL || 'redis://localhost:6380';
  }

  public getPostgresPassword(): string {
    return process.env.POSTGRES_PASSWORD || '';
  }
} 