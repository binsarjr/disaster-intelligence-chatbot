import { ChatgptService } from '@app/external-module/chatgpt.service';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import {
  getJid,
  getMessageCaption,
} from '@app/whatsapp/supports/message.support';
import { WASocket, WAMessage, isJidGroup } from '@whiskeysockets/baileys';
import systemPromptSupport from 'src/supports/systemPrompt.support';

@WhatsappMessage({
  flags: [withSignRegex('ai\\s+.*'), withSignRegex('ask\\s+.*')],
})
export class GroupChatbotAction extends WhatsappMessageAction {
  constructor(private readonly chatgptService: ChatgptService) {
    super();
  }
  @IsEligible()
  notMe(socket: WASocket, message: WAMessage) {
    return !message.key.fromMe;
  }

  @IsEligible()
  onlyGroupChat(socket: WASocket, message: WAMessage) {
    return isJidGroup(getJid(message));
  }
  async execute(socket: WASocket, message: WAMessage): Promise<void> {
    const caption = getMessageCaption(message.message)
      .replace(withSign('ai'), '')
      .replace(withSign('ask'), '')
      .trim();

    const chatgptResponse = await this.chatgptService.sendMessage(
      [
        ...systemPromptSupport.DisasterIntelligence,
        {
          role: 'user',
          content: caption,
        },
      ],
      'gpt-4',
    );

    await socket.sendMessage(
      getJid(message),
      {
        text: chatgptResponse,
      },
      { quoted: message },
    );

    return;
  }
}
