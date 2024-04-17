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
  flags: [withSignRegex('tt .*'), withSign('tt')],
})
export class TiktokDownloaderAction extends WhatsappMessageAction {
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

    let anyError = false;
    await Promise.all(
      urls.map(async (url) => {
        const { video, images } = await this.mediaSaver.snaptik(url.toString());
        if (!video && images.length === 0) anyError = true;
        let totalImage = 0;
        let totalVideo = 0;

        if (video) {
          await socket.sendMessage(
            jid,
            {
              video: {
                url: video,
              },
            },
            { quoted: message },
          );
          totalVideo++;
        }
        for (const image of images) {
          await socket.sendMessage(
            jid,
            {
              image: { url: image },
            },
            { quoted: message },
          );
          totalImage++;
        }

        socket.sendMessage(
          jid,
          {
            text: `
Permintaan berhasil di proses${ReadMoreUnicode}
${totalImage > 0 ? 'Total Gambar: ' + totalImage : ''}
${totalVideo > 0 ? 'Total Video: ' + totalVideo : ''}

> ${url}
              `.trim(),
            contextInfo: {
              externalAdReply: {
                showAdAttribution: true,
                title: 'TikTok Downloader',
                body: url.toString(),
                sourceUrl: url.toString(),
                // @ts-ignore
                previewType: 2,
                mediaType: 2,
                mediaUrl: video,
                thumbnailUrl: images[0],
                renderLargerThumbnail: true,
              },
            },
          },
          { quoted: message },
        );
      }),
    );
    anyError
      ? this.reactToFailed(socket, message)
      : this.reactToDone(socket, message);
  }
}
