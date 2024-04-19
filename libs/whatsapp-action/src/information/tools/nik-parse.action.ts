import { nikParser } from '@app/external-module/nik-parser';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSignRegex('nik .*')],
})
export class NikParseAction extends WhatsappMessageAction {
  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);

    const nikNumber = getMessageCaption(message.message).split(/\s+/, 2)[1];

    const nik = nikParser(nikNumber);
    if (!nik.isValid()) {
      await socket.sendMessage(
        message.key.remoteJid,
        {
          text: 'NIK invalid',
        },
        { quoted: message },
      );
      this.reactToInvalid(socket, message);
      return;
    }

    await socket.sendMessage(
      message.key.remoteJid,
      {
        text: `
NIK: ${nikNumber}

Jenis Kelamin: ${nik.kelamin()}
Lahir: ${nik.lahir()}

Provinsi: ${nik.province()}
Kota: ${nik.kabupatenKota()}
Kecamatan: ${nik.kecamatan()}
Kodepos: ${nik.kodepos()}



      `.trim(),
      },
      { quoted: message },
    );

    this.reactToDone(socket, message);
  }
}
