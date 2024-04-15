import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { getJid } from '@app/whatsapp/supports/message.support';
import { type WAMessage, type WASocket } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

@WhatsappMessage({
  flags: ['welcome'],
})
export class WelcomeCardAction extends WhatsappMessageAction {
  // @IsEligible()
  // async onlyGroup(socket: WASocket, message: WAMessage) {
  //   return isJidGroup(getJid(message));
  // }

  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);
    await socket.sendMessage(
      getJid(message),
      {
        image: await this.loadImage({
          background: 'https://i.ibb.co/dkXJ7rw/1349198-1.jpg',
          title: 'Welcome to this server',
          groupName: message.key.remoteJid!,
          userAvatar: await socket.profilePictureUrl(getJid(message), 'image'),
          totalMember: await socket
            .groupMetadata(getJid(message))
            .then((m) => m.participants.length),
        }),
      },
      { quoted: message },
    );
  }

  async loadImage({
    background,
    title,
    totalMember,
    userAvatar,
    groupName,
  }: {
    background: string;
    title: string;
    groupName: string;
    userAvatar: string;
    totalMember: number;
  }) {
    const url = new URL('https://api.popcat.xyz/welcomecard');
    url.searchParams.append('background', background);
    url.searchParams.append('text1', title);
    url.searchParams.append('text2', groupName);
    url.searchParams.append('text3', `Member ${totalMember}`);
    url.searchParams.append('avatar', userAvatar);
    console.log('sebelum buff');
    const buffer: Buffer = await fetch(url).then((res) => res.buffer());
    console.log('setelah buff');
    return buffer;
  }
}
