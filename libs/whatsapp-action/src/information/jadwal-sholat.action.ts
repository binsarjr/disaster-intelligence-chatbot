import { IslamicFinder } from '@app/external-module/scraper/islamicfinder';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
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

    const [_, kota = 'jakarta'] = customSplit(
      getMessageCaption(message.message!),
      ' ',
      2,
    );
    const negara = 'indonesia';

    const results = await this.islamicFinder.getSchedule(negara, kota);

    let jadwa = results
      .map((result) => `${result.prayerName} ${result.prayerTime}`)
      .join('\n');

    await socket.sendMessage(message.key.remoteJid!, {
      text: `
negara: *${negara}*
Kota: *${kota}*

Jadwal Sholat:
${jadwa}

      `.trim(),
    });

    this.reactToDone(socket, message);
  }
}
