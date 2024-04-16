import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign } from '@app/whatsapp/supports/flag.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('dare')],
})
export class DareAction extends WhatsappMessageAction {
  protected source =
    'https://raw.githubusercontent.com/binsarjr/truth-or-dare-database/main/database/indonesia/dare.txt';
  async execute(socket: WASocket, message: WAMessage) {
    await socket.sendMessage(
      message.key.remoteJid!,
      {
        text: await this.pickRandom(),
      },
      {
        quoted: message,
      },
    );
  }

  async pickRandom() {
    const content = await fetch(this.source).then((res) => res.text());
    const lines = content.split('\n');
    const randomIndex = Math.floor(Math.random() * lines.length);
    return lines[randomIndex];
  }
}
