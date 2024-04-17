import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign } from '@app/whatsapp/supports/flag.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('menuowner')],
})
export class MenuAction extends WhatsappMessageAction {
  async execute(socket: WASocket, message: WAMessage) {
    await socket.sendMessage(
      message.key.remoteJid!,
      {
        text: this.menu(),
      },
      { quoted: message },
    );
  }

  menu() {
    return `
Menu Owner:
.addowner <no_hp>
.removeowner <no_hp>

`.trim();
  }
}
