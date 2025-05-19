import 'dotenv/config';
import { Server } from './src/Server.js';
import { RedisClient } from './src/core/RedisClient.js';

async function bootstrap() {
  try {
    const server = new Server();
    const redisClient = RedisClient.getInstance();
    
    await redisClient.connect();
    
    const app = server.getApp();
    const port = process.env.PORT || 3000;
    
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

bootstrap();