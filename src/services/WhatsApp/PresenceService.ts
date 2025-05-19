import { MessageData } from '../../models/MessageData.js';
import { WhatsAppService } from './WhatsAppService.js';

export class PresenceService extends WhatsAppService {
  private readonly SEND_PRESENCE_URL: string;
  private readonly DEFAULT_DELAY = 3000;

  constructor() {
    super();
    this.SEND_PRESENCE_URL = `/chat/sendPresence/${process.env.EVO_API_INSTANCE}`;
  }

  public async sendPresence(messageData: MessageData, delay: number = this.DEFAULT_DELAY): Promise<void> {
    try {
      await this.makeRequest(this.SEND_PRESENCE_URL, {
        number: messageData.phoneNumber,
        delay: delay,
        presence: 'composing'
      });
    } catch (error) {
      this.logger.getLogger().error({ error }, 'Erro ao enviar presença');
      throw error;
    }
  }
} 