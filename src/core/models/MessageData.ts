export interface MessageData {
  fromMe: boolean;
  phoneNumber: string;
  sender: string;
  conversation: string;
  base64?: string;
  timestamp: Date;
};
