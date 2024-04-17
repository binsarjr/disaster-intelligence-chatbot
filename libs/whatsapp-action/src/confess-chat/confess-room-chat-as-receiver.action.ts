import { PrismaService } from '@app/prisma';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import {
  patternsAndTextIsMatch,
  withSign,
} from '@app/whatsapp/supports/flag.support';
import {
  getJid,
  getMessageCaption,
  getMessageTimestamp,
} from '@app/whatsapp/supports/message.support';
import {
  isJidUser,
  jidNormalizedUser,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';

@WhatsappMessage()
export class ConfessRoomChatAsReceiverAction extends WhatsappMessageAction {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  @IsEligible()
  onPersonalChat(socket: WASocket, message: WAMessage) {
    return isJidUser(message.key.remoteJid) && !message.key.fromMe;
  }

  async execute(socket: WASocket, message: WAMessage) {
    const caption = getMessageCaption(message.message);
    if (patternsAndTextIsMatch([withSign('stopconfess')], caption)) {
      return;
    }

    const confess = await this.prisma.confessChat.findFirst({
      where: {
        receiverJid: message.key.remoteJid!,
      },
    });

    if (!confess) {
      return;
    }

    const jid = jidNormalizedUser(getJid(message));

    if (confess.receiverJid == jid) {
      if (!confess.lastMessageTimestamp) {
        await socket.sendMessage(confess.jid, {
          text: 'Pesan yang anda kirimkan sudah dapat balasan. otomatis memasuki room.silakan lakukan percakapan',
        });
      }

      await socket.sendMessage(confess.jid, {
        forward: message,
      });

      await this.prisma.confessChat.update({
        where: {
          jid: confess.jid,
        },
        data: {
          lastMessageTimestamp: new Date(getMessageTimestamp(message)),
        },
      });
    }
  }
}
