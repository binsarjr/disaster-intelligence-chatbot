import * as ffmpeg from 'fluent-ffmpeg';
import fetch from 'node-fetch';
import { PassThrough } from 'stream';

export const downloadAndConvertToBuffer = async (videoUrl) => {
  try {
    // Download video
    const response = await fetch(videoUrl);
    const videoStream = response.body;

    const outputStream = new PassThrough();

    ffmpeg(videoStream)
      .format('mp3')
      .audioCodec('libmp3lame')
      .on('error', (err) => {
        console.error('ffmpeg error:', err);
      })
      .on('end', () => {
        console.log('Conversion successful');
        outputStream.end();
      })
      .pipe(outputStream, { end: false });

    return outputStream;
  } catch (error) {
    console.error('Error:', error);
  }
};
