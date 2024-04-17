import { Jadwalsholat } from '@app/external-module/scraper/jadwalsholat';
import { ReadMoreUnicode } from '@app/whatsapp/constants';
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
  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);

    const [_, kota = 'jakarta pusat'] = customSplit(
      getMessageCaption(message.message!),
      ' ',
      2,
    );

    const jadwalSholat = new Jadwalsholat();

    const cities = await jadwalSholat.search(kota);
    if (cities.length == 0) {
      await socket.sendMessage(
        message.key.remoteJid!,
        {
          text: `Kota tidak tersedia. gunakan nama kota dengan benar`,
        },
        { quoted: message },
      );
      this.reactToDone(socket, message);
      return;
    }

    const results = await jadwalSholat.schedule(cities[0].cityId);

    await socket.sendMessage(
      message.key.remoteJid!,
      {
        text: `
Jadwal Sholat *${cities[0].cityName}*:

${Object.entries(results.hariini.Waktu)
  .map(([key, value]) => `*${key}*: ${value}`)
  .join('\n')}
${ReadMoreUnicode}
Koordinat untuk kota ini:
${results.parameter.koordinat}

Arah: ${results.parameter.arah}
Jarak: ${results.parameter.jarak}

      `.trim(),
        contextInfo: {
          externalAdReply: {
            title: 'Jadwal Sholat Kota ' + cities[0].cityName,
            sourceUrl:
              'https://jadwalsholat.org/jadwal-sholat/monthly.php?id=' +
              cities[0].cityId,
          },
        },
      },
      { quoted: message },
    );
    this.reactToDone(socket, message);
  }
}
