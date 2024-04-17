import { PrismaService } from '@app/prisma';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign } from '@app/whatsapp/supports/flag.support';
import { getJid } from '@app/whatsapp/supports/message.support';
import {
  isJidUser,
  jidNormalizedUser,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('stopconfess')],
})
export class StopconfessCommandAction extends WhatsappMessageAction {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  @IsEligible()
  onPersonalChat(socket: WASocket, message: WAMessage) {
    return isJidUser(message.key.remoteJid);
  }
  async execute(socket: WASocket, message: WAMessage) {
    const jid = jidNormalizedUser(getJid(message));
    const totalDeleted = await this.prisma.confessChat.deleteMany({
      where: {
        OR: [
          {
            jid,
          },
          { receiverJid: jid },
        ],
      },
    });
    console.log(totalDeleted);

    await socket.sendMessage(
      jid,
      {
        text: 'Anda telah keluar dari room confess',
      },
      { quoted: message },
    );
  }
}
