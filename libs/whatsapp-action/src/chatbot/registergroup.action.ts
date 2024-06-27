import { PrismaService } from '@app/prisma';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign } from '@app/whatsapp/supports/flag.support';
import {
  isJidGroup,
  jidNormalizedUser,
  WAMessage,
  WASocket,
} from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('register')],
})
export class RegisterGroupAction extends WhatsappMessageAction {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  @IsEligible()
  notMe(socket: WASocket, message: WAMessage) {
    return !message.key.fromMe;
  }

  @IsEligible()
  onlyGroupChat(socket: WASocket, message: WAMessage) {
    return isJidGroup(message.key.remoteJid);
  }
  async execute(socket: WASocket, message: WAMessage) {
    let group = await this.prisma.groupChat.findFirst({
      where: {
        jid: jidNormalizedUser(message.key.remoteJid),
      },
    });

    if (!group) {
      const meta = await socket.groupMetadata(message.key.remoteJid);
      group = await this.prisma.groupChat.create({
        data: {
          jid: jidNormalizedUser(message.key.remoteJid),
          name: meta.subject,
        },
      });
    }

    await socket.sendMessage(message.key.remoteJid, {
      text: `
Group Dengan Nama ${group.name} Berhasil Diregistrasi ke sistem disaster intelligence.
`.trim(),
    });
  }
}
