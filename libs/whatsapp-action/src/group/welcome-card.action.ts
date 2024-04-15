import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { getJid } from '@app/whatsapp/supports/message.support';
import {
  isJidGroup,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

@WhatsappMessage({
  flags: ['welcome'],
})
export class WelcomeCardAction extends WhatsappMessageAction {
  @IsEligible()
  async onlyGroup(socket: WASocket, message: WAMessage) {
    return isJidGroup(getJid(message));
  }

  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);

    console.log('getting profile picture');
    const pp = await socket.profilePictureUrl(message.key.participant);
    console.log('getting profile picture done');

    console.log('getting group metadata');
    const groupMetadata = await socket.groupMetadata(getJid(message));
    console.log('getting group metadata done');

    await socket.sendMessage(
      getJid(message),
      {
        image: await this.loadImage({
          background: 'https://i.ibb.co/dkXJ7rw/1349198-1.jpg',
          title: 'Welcome to this server',
          groupName: groupMetadata.subject,
          userAvatar: pp,
          totalMember: groupMetadata.participants.length,
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
    const buffer: Buffer = await fetch(url).then((res) => res.arrayBuffer());
    console.log('setelah buff');
    return buffer;
  }
}
