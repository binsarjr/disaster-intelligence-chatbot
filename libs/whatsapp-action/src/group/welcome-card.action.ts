import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { getJid } from '@app/whatsapp/supports/message.support';
import {
  isJidGroup,
  WAMessageStubType,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

@WhatsappMessage()
export class WelcomeCardAction extends WhatsappMessageAction {
  @IsEligible()
  async onlyGroup(socket: WASocket, message: WAMessage) {
    return isJidGroup(getJid(message));
  }

  @IsEligible()
  async isNewMember(socket: WASocket, message: WAMessage) {
    if (!Object.hasOwn(message, 'messageStubParameters')) return false;

    return message.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD;
  }

  async execute(socket: WASocket, message: WAMessage) {
    const new_participants = message.messageStubParameters;

    let caption = '';
    let jidAvatar = '';

    if (new_participants.length === 1) {
      caption =
        '@' +
        message.messageStubParameters![0]?.split('@')[0] +
        ' Silahkan intro terdahulu! 🤨';
      jidAvatar = message.messageStubParameters![0];
    } else {
      caption = '@newmembers silahkan intro terdahulu! 🤨';
      jidAvatar = getJid(message);
    }

    const [pp, groupMetadata] = await Promise.all([
      socket
        .profilePictureUrl(jidAvatar)
        .catch(
          () =>
            'https://i.ibb.co/vXzDh4y/gradient-lo-fi-illustrations-52683-84144.jpg',
        ),
      socket.groupMetadata(getJid(message)),
    ]);

    await socket.sendMessage(getJid(message), {
      image: await this.loadImage({
        background: 'https://i.ibb.co/dkXJ7rw/1349198-1.jpg',
        title: 'Welcome to',
        groupName: groupMetadata.subject,
        userAvatar: pp,
        totalMember: groupMetadata.participants.length,
      }),
      caption,
      mentions: new_participants,
    });
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
    const buffer = await fetch(url).then((res) => res.arrayBuffer());
    return Buffer.from(buffer);
  }
}
