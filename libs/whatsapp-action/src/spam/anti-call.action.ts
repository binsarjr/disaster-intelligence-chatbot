import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import {
  WAMessageStubType,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';

@WhatsappMessage()
export class AntiCallAction extends WhatsappMessageAction {
  async execute(socket: WASocket, message: WAMessage) {
    if (
      [
        WAMessageStubType.CALL_MISSED_VIDEO,
        WAMessageStubType.CALL_MISSED_VOICE,
      ].includes(message.messageStubType)
    ) {
      await socket.sendMessage(message.key.remoteJid, {
        text: 'Please do not call me',
      });
      return;
    }
  }
}
