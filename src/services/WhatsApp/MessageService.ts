import { MessageData } from '../../models/MessageData.js';
import { WhatsAppService } from './WhatsAppService.js';

export class MessageService extends WhatsAppService {
  private readonly SEND_MSG_URL: string;

  constructor() {
    super();
    this.SEND_MSG_URL = `/message/sendText/${process.env.EVO_API_INSTANCE}`;
  }

  public async sendMessage(messageData: MessageData, messageToSend: string): Promise<void> {
    try {
      await this.makeRequest(this.SEND_MSG_URL, {
        number: messageData.phoneNumber,
        text: messageToSend
      });
    } catch (error) {
      this.logger.getLogger().error({ error }, 'Erro ao enviar mensagem');
      throw error;
    }
  }
} 