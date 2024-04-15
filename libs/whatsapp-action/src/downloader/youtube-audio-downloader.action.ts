import { MediaSaver } from '@app/external-module/mediasaver';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { downloadAndConvertToBuffer } from 'src/supports/file.support';
import { injectRandomHiddenText } from 'src/supports/str.support';
import { streamToBuffer } from 'src/supports/stream.support';
import { extractUrls } from 'src/supports/url.support';
import * as ytdl from 'ytdl-core';

@WhatsappMessage({
  flags: [withSignRegex('ytaudio .*'), withSign('ytaudio')],
})
export class YoutubeAudioDownloaderAction extends WhatsappMessageAction {
  constructor(private readonly mediaSaver: MediaSaver) {
    super();
  }
  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);
    const text = getMessageCaption(message.message!);

    const urls: URL[] = extractUrls(text);
    const jid = message.key.remoteJid!;

    if (urls.length === 0) {
      socket.sendMessage(
        jid,
        {
          text: injectRandomHiddenText('Please provide a valid Youtube URL'),
        },
        { quoted: message },
      );
      this.reactToInvalid(socket, message);

      return;
    }

    await Promise.all(
      urls.map(async (url) => {
        const info = await ytdl.getInfo(url.toString());
        // const formats = info.formats.filter(
        //   (format: ytdl.videoFormat) =>
        //     format.hasAudio &&
        //     format.container == 'mp4' &&
        //     format.mimeType.includes('audio'),
        // );
        const formats = info.formats.filter(
          (format: ytdl.videoFormat) =>
            format.container === 'mp4' &&
            new RegExp(/720|480|360|240|270|144/).test(format.qualityLabel) &&
            format.hasAudio === true,
        );

        const stream = await downloadAndConvertToBuffer(formats[0].url);
        const buffer = await streamToBuffer(stream);

        await socket.sendMessage(
          jid,
          {
            audio: buffer,
            mimetype: formats[0].mimeType.split(';')[0],
          },
          { quoted: message },
        );
      }),
    );
    this.reactToDone(socket, message);
  }
}
