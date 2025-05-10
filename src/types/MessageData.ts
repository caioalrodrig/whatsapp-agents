export interface MessageData {
  phoneNumber: string;
  sender: string;
  message: string;
  base64: string | undefined;
  dateTime: Date;
};
