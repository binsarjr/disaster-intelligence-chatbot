import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('startconfess'), withSignRegex('startconfess .*')],
})
export class StartConfessChatAction extends WhatsappMessageAction {
  async execute(socket: WASocket, message: WAMessage) {
    await socket.sendMessage(message.key.remoteJid!, {
      text: `
Confess Mode aktif

Kirimkan pesan yang ingin dikirimkan dengan format:

nama pengirim: 
pesan: 


        `.trim(),
    });
  }
}
