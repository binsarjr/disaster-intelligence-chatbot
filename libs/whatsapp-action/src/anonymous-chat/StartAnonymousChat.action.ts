import { PrismaService } from '@app/prisma';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign } from '@app/whatsapp/supports/flag.support';
import {
  jidNormalizedUser,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('startanonim')],
})
export class StartAnonymousChatAction extends WhatsappMessageAction {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  async execute(socket: WASocket, message: WAMessage) {
    await this.prisma.anonymousChat.upsert({
      where: {
        id: jidNormalizedUser(message.key.remoteJid),
      },
      update: {},
      create: {
        id: jidNormalizedUser(message.key.remoteJid),
      },
    });

    const total = await this.prisma.anonymousChat.count();

    await socket.sendMessage(message.key.remoteJid!, {
      text: `
Kamu telah masuk dan berhasil mengaktifkan mode anonim.

total partner terdaftar: ${total}

Perintah yang tersedia:
- *${withSign('find')}* untuk mencari partner
- *${withSign('next')}* untuk mencari partner berikutnya
- *${withSign('endanonim')}* untuk menyelesaikan chat dan keluar dari mode anonim

        `.trim(),
    });
  }
}
