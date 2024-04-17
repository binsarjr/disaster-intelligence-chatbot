import { MediaSaver } from '@app/external-module/mediasaver';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { injectRandomHiddenText } from 'src/supports/str.support';
import { extractUrls } from 'src/supports/url.support';

@WhatsappMessage({
  flags: [withSignRegex('ttaudio .*'), withSign('ttaudio')],
})
export class TiktokAudioDownloaderAction extends WhatsappMessageAction {
  constructor(private readonly mediaSaver: MediaSaver) {
    super();
  }

  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);
    const text = getMessageCaption(message.message!);

    const urls: URL[] = extractUrls(text);
    const jid = message.key.remoteJid!;

    if (urls.length === 0) {
      await socket.sendMessage(
        jid,
        {
          text: injectRandomHiddenText('Please provide a valid TikTok URL'),
        },
        { quoted: message },
      );

      this.reactToInvalid(socket, message);
      return;
    }

    for (const url of urls) {
      const { success, data } = await this.mediaSaver.bravedown(
        url.toString(),
        'tiktok-downloader',
      );
      if (success) {
        data.links.map(async (link) => {
          console.log(link);
          if (link.type === 'audio') {
            await socket.sendMessage(
              jid,
              {
                audio: {
                  url: link.url,
                },
                mimetype: 'audio/mp4',
                contextInfo: {
                  externalAdReply: {
                    title: 'TikTok Audio Downloader',
                    body: url.toString(),
                    sourceUrl: url.toString(),
                    // @ts-ignore
                    previewType: 2,
                    mediaType: 2,
                    mediaUrl: link.url,
                    thumbnailUrl: link.url,
                  },
                },
              },
              { quoted: message },
            );
          }
        });
      }
    }
    this.reactToDone(socket, message);
  }
}
