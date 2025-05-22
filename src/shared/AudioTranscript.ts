import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { Logger } from '../core/config/Logger.js';

export class AudioTranscript {
  private readonly openai: OpenAI;
  private readonly logger: ReturnType<typeof Logger.getInstance>;
  private readonly tempDir: string;

  constructor() {
    this.openai = new OpenAI();
    this.logger = Logger.getInstance();
    this.tempDir = path.join(process.cwd(), 'temp');
    this.ensureTempDirectory();
  }

  private ensureTempDirectory(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir);
    }
  }

  private createTempFile(base64: string): string {
    const tempFile = path.join(this.tempDir, `temp_audio_${Date.now()}.mp3`);
    const audioBuffer = Buffer.from(base64.split(',')[1] || base64, 'base64');
    fs.writeFileSync(tempFile, audioBuffer);
    return tempFile;
  }

  private async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      this.logger.getLogger().error({ error, filePath }, 'Erro ao remover arquivo temporário');
    }
  }

  public async transcript(base64: string): Promise<string> {
    let tempFile: string | null = null;
    let fileStream: fs.ReadStream | null = null;

    try {
      tempFile = this.createTempFile(base64);
      fileStream = fs.createReadStream(tempFile);

      const response = await this.openai.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
      });

      return response.text;
    } catch (error) {
      this.logger.getLogger().error({ error }, 'Erro ao transcrever áudio');
      throw error;
    } finally {
      if (fileStream) {
        fileStream.close();
      }
      if (tempFile) {
        await this.cleanupTempFile(tempFile);
      }
    }
  }
} 