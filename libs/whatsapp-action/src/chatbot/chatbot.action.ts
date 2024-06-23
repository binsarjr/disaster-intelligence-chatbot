import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WAEvent } from '@app/whatsapp/decorators/wa-event.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { getJid } from '@app/whatsapp/supports/message.support';
import { isJidUser, WAMessage, WASocket } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: /.*/,
})
export class ChatbotAction extends WhatsappMessageAction {
  @IsEligible()
  onlyPrivateChat(socket: WASocket, message: WAMessage) {
    return isJidUser(getJid(message));
  }
  async execute(socket: WASocket, message: WAMessage) {
    console.log(JSON.stringify(message, null, 2));
  }
}
