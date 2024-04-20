import { ReadMoreUnicode } from '@app/whatsapp/constants';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign } from '@app/whatsapp/supports/flag.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('menu'), withSign('list'), withSign('help')],
})
export class SimpleMenuAction extends WhatsappMessageAction {
  async execute(socket: WASocket, message: WAMessage) {
    await socket.sendMessage(
      message.key.remoteJid!,
      {
        text: this.menu(),
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            title: 'Karina Whatsapp Bot',
            body: 'Simple Menu',
            renderLargerThumbnail: true,
            mediaType: 1,
            sourceUrl: 'https://whatsapp.com/channel/0029VabgCmX1SWt6DGepyM2e',
            thumbnailUrl:
              'https://static.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/p1/916/2023/11/28/kpopchart-33-3087925243.png',
          },
        },
      },
      { quoted: message },
    );
  }

  menu() {
    return `
Menu:
- *${withSign('sholat <kota>')}* - Jadwal Sholat
- *${withSign('hd')}* - convert image to HD
- *${withSign('s')}* - image to sticker
- *${withSign('stiker')}* - image to sticker 
- *${withSign('img')}* - sticker to image
- *${withSign('toimg')}* - sticker to image
- *${withSign('ping')}* - ping bot
- *${withSign('menu')}* - Show this menu



${ReadMoreUnicode}
Downloader:
- *${withSign('tt')} <link>* - Download video from TikTok
- *${withSign('ttaudio')} <link>* - Download audio from TikTok
- *${withSign('ig')} <link>* - Download video from Instagram
- *${withSign('igaudio')} <link>* - Download audio from Instagram
- *${withSign('yt')} <link>* - Download video from Youtube
- *${withSign('ytaudio')} <link>* - Download audio from Youtube

${ReadMoreUnicode}
Game Truth Or Dare:
- *${withSign('dare')}* - Dare Game
- *${withSign('truth')}* - Truth Game

${ReadMoreUnicode}

Tools:
- *${withSign('nik <nik 16 digit>')}* - NIK Parser

${ReadMoreUnicode}
Cek Resi
- *${withSign('cekresi <resi>')}* - Cek Resi otomatis cek expedisi (Lebih Lambat)
- *${withSign('jne <resi>')}* - Cek Resi dari JNE
- *${withSign('tiki <resi>')}* - Cek Resi dari TIKI

${ReadMoreUnicode}
Shortener:
- *${withSign('unguin <original link>')}* - Shorten link with Ungu.in
- *${withSign('unguin <custom shorten link> <original link>')}* - Custom Shorten link with Ungu.in

${ReadMoreUnicode}
> Timestamp: ${new Date().toLocaleString()}

    `.trim();
  }
}
