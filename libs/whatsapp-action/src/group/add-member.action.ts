import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import {
  getContextInfo,
  getJid,
  getMessageCaption,
  getMessageQutoedCaption,
} from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import {
  isJidGroup,
  jidEncode,
  jidNormalizedUser,
} from '@whiskeysockets/baileys';
import { findPhoneNumbersInText } from 'libphonenumber-js';

@WhatsappMessage({
  flags: [withSignRegex('add .*'), withSign('add')],
})
export class AddMemberAction extends WhatsappMessageAction {
  @IsEligible()
  async onlyGroup(socket: WASocket, message: WAMessage) {
    return isJidGroup(getJid(message));
  }

  @IsEligible()
  async isAdmin(socket: WASocket, message: WAMessage) {
    const metadata = await socket.groupMetadata(getJid(message));

    const me = metadata.participants.find(
      (participant) =>
        jidNormalizedUser(participant.id) ===
        jidNormalizedUser(socket.user?.id),
    );
    if (!me.admin) return false;

    return !!metadata.participants.find(
      (participant) =>
        message.key.participant === jidNormalizedUser(participant.id),
    )?.admin;
  }

  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);

    let mentionedJid = getContextInfo(message)?.mentionedJid || [];
    const caption = getMessageCaption(message.message!) || '';
    const quoted = getMessageQutoedCaption(message.message!) || '';
    const phones = findPhoneNumbersInText(caption + ' ' + quoted, 'ID');

    phones.map((phone) => {
      const phoneJid = jidEncode(
        phone.number.number.replace('+', ''),
        's.whatsapp.net',
      );
      if (!mentionedJid.includes(phoneJid)) {
        mentionedJid.push(phoneJid);
      }
    });

    mentionedJid = mentionedJid.filter(
      (jid) => jidNormalizedUser(jid) != jidNormalizedUser(socket.user?.id),
    );

    try {
      await socket.groupParticipantsUpdate(
        getJid(message),
        mentionedJid,
        'add',
      );
      await this.reactToDone(socket, message);
    } catch (error) {
      await this.reactToFailed(socket, message);
    }
  }
}
