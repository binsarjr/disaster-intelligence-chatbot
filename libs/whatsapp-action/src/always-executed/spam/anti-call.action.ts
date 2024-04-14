import { WAEvent } from '@app/whatsapp/decorators/wa-event.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import {
  delay,
  isJidUser,
  WAMessageStubType,
  type WACallEvent,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';
import { randomInteger } from 'src/supports/number.support';

@WhatsappMessage()
export class AntiCallAction extends WhatsappMessageAction {
  @WAEvent('call')
  async onCall(socket: WASocket, calls: WACallEvent[]) {
    for (const call of calls) {
      if (call.status == 'ringing') {
        await delay(randomInteger(1000, 2000));
        await socket.rejectCall(call.id, call.chatId);
      }

      if (call.status == 'reject' && isJidUser(call.chatId)) {
        await socket.sendMessage(call.chatId, {
          text: 'Please do not call me',
        });
      }
    }
  }

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
