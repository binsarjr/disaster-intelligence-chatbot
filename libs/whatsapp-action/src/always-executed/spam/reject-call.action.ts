import { WAEvent } from '@app/whatsapp/decorators/wa-event.decorator';
import { Injectable } from '@nestjs/common';
import {
  isJidUser,
  type WACallEvent,
  type WASocket,
} from '@whiskeysockets/baileys';
import { injectRandomHiddenText } from 'src/supports/str.support';

@Injectable()
export class RejectCallAction {
  @WAEvent('call')
  async onCall(socket: WASocket, calls: WACallEvent[]) {
    for (const call of calls) {
      if (call.status == 'offer') {
        await socket.rejectCall(call.id, call.chatId);
      }

      if (call.status == 'reject' && isJidUser(call.chatId)) {
        await socket.sendMessage(call.chatId, {
          text: injectRandomHiddenText(
            'Mohon maaf nomor ini tidak menerima panggilan masuk apapun. Mohon pengertiannya',
          ),
        });
      }
    }
  }
}
