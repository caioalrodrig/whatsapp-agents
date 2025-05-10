import 'dotenv/config';
import fs from 'fs';
import OpenAI from 'openai';
import { pino } from 'pino';
import { handleAudioFile } from './utils/handleAudioFile.js';

const logger = pino({ level: 'debug' });

export const transcriptAudio = async (base64: string): Promise<string> => {
  try {
    const model = new OpenAI();
    const tempFile = handleAudioFile(base64);

    const fileStream = fs.createReadStream(tempFile);
    const response = await model.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
    });

    fileStream.close();
    await fs.promises.unlink(tempFile);

    return response.text;
  } catch (error) {
    logger.error({ error }, 'Erro ao transcrever áudio');
    throw error;
  }
};
