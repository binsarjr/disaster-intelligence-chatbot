import { WAEvent } from '@app/whatsapp/decorators/wa-event.decorator';
import { Injectable } from '@nestjs/common';
import {
  delay,
  isJidUser,
  type WACallEvent,
  type WASocket,
} from '@whiskeysockets/baileys';
import { randomInteger } from 'src/supports/number.support';

@Injectable()
export class RejectCallAction {
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
}
