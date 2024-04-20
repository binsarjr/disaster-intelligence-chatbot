import { CekResi } from '@app/external-module/cekresei';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSignRegex('cekresi .*')],
})
export class CekResiAction extends WhatsappMessageAction {
  constructor(private readonly cekresi: CekResi) {
    super();
  }
  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);

    const [_, ...resis] = getMessageCaption(message.message).split(/\s+/);
    if (!resis.length) {
      this.reactToFailed(socket, message);

      return;
    }
    for (const resi of resis) {
      const result = await this.cekresi.checkAll(resi);
      if (!result) {
        await socket.sendMessage(
          message.key.remoteJid!,
          {
            text: 'Resi tidak ditemukan',
          },
          { quoted: message },
        );
        continue;
      }

      await socket.sendMessage(
        message.key.remoteJid!,
        {
          text: result.text,
          contextInfo: {
            externalAdReply: {
              showAdAttribution: true,
              title: 'CEKRESI - ' + result.name,
              body: resi,
              sourceUrl: `https://cekresi.com/?noresi=${resi}`,
              mediaType: 1,
              thumbnailUrl: result.thumbnail,
              renderLargerThumbnail: true,
            },
            forwardingScore: Math.random() * 100,
          },
        },
        { quoted: message },
      );
    }
    this.reactToDone(socket, message);
  }
}
