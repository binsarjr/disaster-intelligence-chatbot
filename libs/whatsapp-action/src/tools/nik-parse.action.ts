import { nikParser } from '@app/external-module/nik-parser';
import { ReadMoreUnicode } from '@app/whatsapp/constants';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { injectRandomHiddenText } from 'src/supports/str.support';

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
        text:
          `
NIK: ${nikNumber}

Jenis Kelamin: ${nik.kelamin()}
Lahir: ${nik.lahir()}

Provinsi: ${nik.province()}
Kota: ${nik.kabupatenKota()}
Kecamatan: ${nik.kecamatan()}
Kodepos: ${nik.kodepos()}

${ReadMoreUnicode}


      `.trim() +
          '\n' +
          injectRandomHiddenText(`NIK terdiri dari 16 digit. Kode penyusun NIK terdiri dari 2 digit awal merupakan kode provinsi, 2 digit setelahnya merupakan kode kota/kabupaten, 2 digit sesudahnya kode kecamatan, 6 digit selanjutnya merupakan tanggal lahir dalam format hhbbtt (untuk wanita tanggal ditambah 40), lalu 4 digit terakhir merupakan nomor urut yang dimulai dari 0001. Sebagai contoh, misalkan seorang perempuan lahir di Kota Bandung tanggal 17 Agustus 1990 maka NIK-nya adalah: 10 50 24 570890 0001. Apabila ada orang lain (perempuan) dengan domisili dan tanggal lahir yang sama mendaftar, maka NIK-nya adalah 10 50 24 570890 0002. Apabila ada orang lain (laki-laki) dengan domisili dan tanggal lahir yang sama mendaftar, maka NIK-nya adalah 10 50 24 170890 0001.
      `),
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            title: 'NIK Parser',
            body: nikNumber,
            sourceUrl: 'https://id.wikipedia.org/wiki/Nomor_Induk_Kependudukan',
            renderLargerThumbnail: true,
            mediaType: 1,
            thumbnailUrl:
              'https://cdns.diadona.id/diadona.id/resources/news/2020/06/12/12874/664xauto-arti-nik-dan-manfaatnya-untuk-suatu-penduduk-serta-perusahaan--2006120.jpg',
          },
        },
      },
      { quoted: message },
    );

    this.reactToDone(socket, message);
  }
}
