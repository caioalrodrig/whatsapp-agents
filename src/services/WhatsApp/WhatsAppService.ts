import { MessageData } from '../../core/models/MessageData.js';
import { Logger } from '../../core/config/Logger.js';
import { Environment } from '../../core/config/Environment.js';

export abstract class WhatsAppService {
  protected logger: ReturnType<typeof Logger.getInstance>;
  protected env: ReturnType<typeof Environment.getInstance>;
  protected readonly API_KEY: string;
  protected readonly BASE_URL: string;

  constructor() {
    this.logger = Logger.getInstance();
    this.env = Environment.getInstance();
    this.API_KEY = process.env.EVO_API_KEY ?? '';
    this.BASE_URL = process.env.EVO_SERVER_URL ?? '';
  }

  protected async makeRequest(endpoint: string, body: any): Promise<any> {
    const url = `${this.BASE_URL}${endpoint}`;
    
    this.logger.getLogger().debug({ 
      url, 
      body, 
      hasApiKey: !!this.API_KEY,
      hasBaseUrl: !!this.BASE_URL 
    }, '🔍 Debug requisição WhatsApp');

    try {
      const options = {
        method: 'POST',
        headers: { 
          apikey: this.API_KEY, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(body)
      };

      const response = await fetch(url, options);
      return await response.json();
    } catch (err) {
      this.logger.getLogger().error({ err }, 'Erro na requisição WhatsApp');
      throw err;
    }
  }
} 