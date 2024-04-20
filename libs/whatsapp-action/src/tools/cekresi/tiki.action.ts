import { CekResi } from '@app/external-module/cekresei';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSignRegex('tiki .*')],
})
export class TikiAction extends WhatsappMessageAction {
  constructor(private readonly cekresi: CekResi) {
    super();
  }
  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);

    const [_, ...resi] = getMessageCaption(message.message).split(/\s+/);
    await Promise.all(
      resi.map(async (resi) => {
        const result = await this.cekresi.tiki(resi);
        if (!result) {
          await socket.sendMessage(
            message.key.remoteJid!,
            {
              text: 'Resi tidak ditemukan',
            },
            { quoted: message },
          );
          this.reactToFailed(socket, message);
          return;
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
            },
          },
          { quoted: message },
        );
        this.reactToDone(socket, message);
      }),
    );
  }
}
