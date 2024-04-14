import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign } from '@app/whatsapp/supports/flag.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { injectRandomHiddenText } from 'src/supports/str.support';

@WhatsappMessage({
  flags: [withSign('menu'), withSign('list'), withSign('help')],
})
export class SimpleMenuAction extends WhatsappMessageAction {
  async execute(socket: WASocket, message: WAMessage) {
    await socket.sendMessage(
      message.key.remoteJid!,
      {
        text: injectRandomHiddenText(this.menu()),
      },
      { quoted: message },
    );
  }

  menu() {
    return `
Menu:
- *${withSign('tt')} <link>* - Download video from TikTok
- *${withSign('ig')} <link>* - Download video from Instagram
- *${withSign('hd')} <link>* - convert image to HD
- *${withSign('s')}* - image to sticker
- *${withSign('stiker')}* - image to sticker 
- *${withSign('img')}* - sticker to image
- *${withSign('toimg')}* - sticker to image
- *${withSign('ping')}* - ping bot
- *${withSign('menu')}* - Show this menu

    `.trim();
  }
}
