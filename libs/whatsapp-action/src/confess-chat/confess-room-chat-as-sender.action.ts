import { PrismaService } from '@app/prisma';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { getJid } from '@app/whatsapp/supports/message.support';
import {
  isJidUser,
  jidNormalizedUser,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';

@WhatsappMessage()
export class ConfessRoomChatAsSenderAction extends WhatsappMessageAction {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  @IsEligible()
  onPersonalChat(socket: WASocket, message: WAMessage) {
    return isJidUser(message.key.remoteJid) && !message.key.fromMe;
  }

  async execute(socket: WASocket, message: WAMessage) {
    const confess = await this.prisma.confessChat.findFirst({
      where: {
        jid: message.key.remoteJid!,
      },
    });

    if (!confess) {
      return;
    }

    const jid = jidNormalizedUser(getJid(message));

    if (confess.jid == jid && confess.lastMessageTimestamp) {
      await socket.sendMessage(confess.receiverJid, {
        forward: message,
      });
    }
  }
}
