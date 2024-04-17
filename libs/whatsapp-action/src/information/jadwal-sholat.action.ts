import { IslamicFinder } from '@app/external-module/scraper/islamicfinder';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import { jadwalsholat } from '@bochilteam/scraper-religions';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { customSplit } from 'src/supports/str.support';

@WhatsappMessage({
  flags: [withSign('sholat'), withSignRegex('sholat .*')],
})
export class JadwalSholatAction extends WhatsappMessageAction {
  constructor(private readonly islamicFinder: IslamicFinder) {
    super();
  }
  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);

    const [_, kota = 'jakarta pusat'] = customSplit(
      getMessageCaption(message.message!),
      ' ',
      2,
    );

    try {
      const results = await jadwalsholat(kota);

      await socket.sendMessage(message.key.remoteJid!, {
        text: `
Jadwal Sholat *${kota}*:

${Object.entries(results.today)
  .map(([key, value]) => `*Sholat ${key}*: ${value}`)
  .join('\n')}

      `.trim(),
      });
      this.reactToDone(socket, message);
    } catch (error) {
      const text = error.message;
      if (text.includes('Did you mean')) {
        await socket.sendMessage(
          message.key.remoteJid!,
          {
            text: `${text}`,
          },
          { quoted: message },
        );
      }
      console.error(error);
      this.reactToFailed(socket, message);
    }
  }
}
