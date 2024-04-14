import { MediaSaver } from '@app/external-module/mediasaver';
import { ReadMoreUnicode } from '@app/whatsapp/constants';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { injectRandomHiddenText } from 'src/supports/str.support';
import { extractUrls } from 'src/supports/url.support';

@WhatsappMessage({
  flags: [withSignRegex('x .*'), withSign('x')],
})
export class XDownloaderAction extends WhatsappMessageAction {
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
        'twitter-video-downloader',
      );
      if (success) {
        const links = data.links.filter(
          (link) => !RegExp('^1080').test(link.quality as unknown as string),
        );

        await socket.sendMessage(
          jid,
          {
            video: {
              url: links[links.length - 1].url,
            },
          },
          { quoted: message },
        );

        await socket.sendMessage(
          jid,
          {
            text: `
Permintaan berhasil di proses${ReadMoreUnicode}
Title: ${data.title}

> ${url}
              `.trim(),
          },
          { quoted: message },
        );
      }
    }

    this.reactToDone(socket, message);
  }
}
