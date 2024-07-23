import { PrismaService } from '@app/prisma';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign } from '@app/whatsapp/supports/flag.support';
import {
  WAMessage,
  WASocket,
  isJidGroup,
  jidNormalizedUser,
} from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('reset')],
})
export class ResetAction extends WhatsappMessageAction {
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
    await this.prisma.historyAnnouncement.deleteMany();
    await socket.sendMessage(message.key.remoteJid, {
      text: 'data has been reset',
    });
  }
}
