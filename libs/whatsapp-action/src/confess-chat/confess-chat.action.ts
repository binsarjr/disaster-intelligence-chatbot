import { PrismaService } from '@app/prisma';
import { ReadMoreUnicode } from '@app/whatsapp/constants';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import {
  getJid,
  getMessageCaption,
} from '@app/whatsapp/supports/message.support';
import {
  isJidUser,
  jidEncode,
  jidNormalizedUser,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';
import { parsePhoneNumber } from 'libphonenumber-js';
import { customSplit } from 'src/supports/str.support';

@WhatsappMessage({
  flags: [withSign('confess'), withSignRegex('confess .*')],
})
export class ConfessChatAction extends WhatsappMessageAction {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  @IsEligible()
  async inPersonalChat(socket: WASocket, message: WAMessage) {
    const isUserChat = isJidUser(message.key.remoteJid);

    if (!isUserChat) {
      await socket.sendMessage(
        message.key.remoteJid!,
        {
          text: 'Fitur ini hanya bisa digunakan dalam chat pribadi',
        },
        { quoted: message },
      );
      return;
    }

    return isUserChat;
  }

  async execute(socket: WASocket, message: WAMessage) {
    const caption = getMessageCaption(message.message);
    let args = customSplit(caption.replace(/\s+/, ' '), ' ', 2);

    if (args.length == 1) {
      await socket.sendMessage(
        message.key.remoteJid!,
        {
          text: `
Cara Penggunaan:
${withSign('confess')} <no_tujuan>|<pesan>

bisa juga menambahkan nama pengirim dengan format:

${withSign('confess')} <no_tujuan>|<nama pengirim>|<pesan>
  
  `.trim(),
        },
        { quoted: message },
      );

      return;
    }

    args = customSplit(args[1], '|', 3);

    const phoneNumber = (() => {
      try {
        // indonesia format first
        let textPhone = (args[0] as string).startsWith('0')
          ? (args[0] as string).replace(/^0/, '+62')
          : args[0];
        textPhone = '+' + textPhone.replace('+', '');
        const phoneNumber = parsePhoneNumber(textPhone);
        return `${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`;
      } catch (error) {
        return null;
      }
    })();

    if (!phoneNumber) {
      await socket.sendMessage(
        message.key.remoteJid!,
        {
          text: 'nomer telepon tidak valid. Silahkan masukkan nomor telepon yang valid, beserta kode negaranya',
        },
        { quoted: message },
      );

      return;
    }

    let to = jidEncode(phoneNumber, 's.whatsapp.net');

    let senderMessage = args[args.length - 1];
    let sender = args.length == 3 ? args[1] : null;

    let text = `
Halo kami dari bot confess. ada pesan nih untukmu.

${sender ? `Pengirim: ${sender}` : ''}
Pesan: ${senderMessage}

${ReadMoreUnicode}
Begitu kamu membalas pesan ini, kamu otomatis terhubung dengan room confess bersama pengirim.

Jika ingin keluar room , silakan mengirim pesan dengan format:

${withSign('stopconfess')}
    `.trim();

    const jid = jidNormalizedUser(getJid(message));

    const receiver = await this.prisma.confessChat.findFirst({
      where: {
        receiverJid: to,
        NOT: {
          jid,
        },
      },
    });
    if (receiver) {
      await socket.sendMessage(
        message.key.remoteJid!,
        {
          text: 'Nomer ini saat ini sedang berada didalam room confess lain. coba lagi nanti',
        },
        { quoted: message },
      );
      return;
    }

    await this.prisma.confessChat.upsert({
      where: {
        jid,
      },
      update: {
        senderName: sender,
        message: senderMessage,
        receiverJid: to,
        lastMessageTimestamp: null,
      },
      create: {
        jid: jid,
        senderName: sender,
        message: senderMessage,
        receiverJid: to,
      },
    });

    await socket.sendMessage(to, {
      text,
    });
    await socket.sendMessage(jid, {
      text: 'Kami sudah mengirim pesan anda silakan tunggu balasan',
    });
  }
}
