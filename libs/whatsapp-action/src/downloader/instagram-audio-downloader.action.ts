import { MediaSaver } from '@app/external-module/mediasaver';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { injectRandomHiddenText } from 'src/supports/str.support';
import { extractUrls } from 'src/supports/url.support';

@WhatsappMessage({
  flags: [withSignRegex('igaudio .*'), withSign('igaudio')],
})
export class InstagramAudioDownloaderAction extends WhatsappMessageAction {
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
          text: injectRandomHiddenText('Please provide a valid Instagram URL'),
        },
        { quoted: message },
      );
      this.reactToInvalid(socket, message);

      return;
    }

    await Promise.all(
      urls.map(async (url) => {
        const { data } = await this.mediaSaver.saveTube(
          url.toString(),
          'downloadAudio',
        );

        if (data.url) {
          await socket.sendMessage(
            jid,
            {
              audio: {
                url: data.url,
              },
              mimetype: 'audio/mp4',
              contextInfo: {
                externalAdReply: {
                  title: 'Instagram Audio Downloader',
                  body: url.toString(),
                  sourceUrl: url.toString(),
                  // @ts-ignore
                  previewType: 2,
                  mediaType: 2,
                  mediaUrl: data.url,
                  thumbnailUrl: data.url,
                },
              },
            },

            { quoted: message },
          );
        }
      }),
    );
    this.reactToDone(socket, message);
  }
}
