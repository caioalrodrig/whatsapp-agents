import path from 'path';
import fs from 'fs';

export const handleAudioFile = (base64: string): string => {
  const tempDir = path.join(process.cwd(), 'temp');

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const tempFile = path.join(tempDir, `temp_audio_${Date.now()}.mp3`);
  const audioBuffer = Buffer.from(base64.split(',')[1] || base64, 'base64');
  fs.writeFileSync(tempFile, audioBuffer);

  return tempFile;
};