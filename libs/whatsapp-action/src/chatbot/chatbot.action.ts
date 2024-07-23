import { ChatgptService, Prompts } from '@app/external-module/chatgpt.service';
import { PrismaService } from '@app/prisma';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import {
  downloadContentBufferFromMessage,
  getJid,
  getMessageCaption,
} from '@app/whatsapp/supports/message.support';
import { isJidUser, WAMessage, WASocket } from '@whiskeysockets/baileys';
import { catchError } from 'rxjs';
import { whatsappFormat } from 'src/supports/str.support';
import systemPromptSupport from 'src/supports/systemPrompt.support';
//https://chatgpt.com/c/ec19ad1d-e2d2-4375-b75b-3aff0f3c9fca

@WhatsappMessage({
  flags: /.*/,
})
export class ChatbotAction extends WhatsappMessageAction {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatgptService: ChatgptService,
  ) {
    super();
  }

  @IsEligible()
  notMe(socket: WASocket, message: WAMessage) {
    return !message.key.fromMe;
  }

  @IsEligible()
  onlyPrivateChat(socket: WASocket, message: WAMessage) {
    return isJidUser(getJid(message));
  }

  async clearHistoryIfMoreThanOneHour(socket: WASocket, message: WAMessage) {
    const latestHistory = await this.prisma.historyChat.findFirst({
      where: {
        jid: getJid(message),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    const messageTimestamp = +message?.messageTimestamp;

    if (latestHistory) {
      const diff = Math.abs(
        (latestHistory.createdAt.getTime() - messageTimestamp * 1000) / 1000,
      );
      if (diff > 3600) {
        await this.prisma.historyChat.deleteMany({
          where: {
            jid: getJid(message),
          },
        });
      }
    }
  }

  async getUserMessage(socket: WASocket, message: WAMessage) {
    const histories = await this.prisma.historyChat.findMany({
      where: {
        jid: getJid(message),
      },
    });

    const prompts: Prompts = systemPromptSupport.DisasterIntelligence;
    for (const history of histories) {
      const meta = history.meta as any;
      prompts.push({
        role: history.fromMe ? 'assistant' : 'user',
        content: getMessageCaption(meta.message),
      });
    }

    let photoBuffer: Buffer | null = null;
    {
      try {
        const directPath = message?.message?.imageMessage?.directPath;
        const mediaKey = message?.message?.imageMessage?.mediaKey;
        const url = message?.message?.imageMessage?.url;
        photoBuffer = await downloadContentBufferFromMessage(
          {
            directPath,
            mediaKey,
            url,
          },
          'image',
        );

        if (photoBuffer) {
          prompts.push({
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url:
                    'data:image/jpeg;base64,' + photoBuffer.toString('base64'),
                },
              },
              {
                type: 'text',
                text: getMessageCaption(message.message),
              },
            ],
          });
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!photoBuffer) {
      prompts.push({
        role: 'user',
        content: getMessageCaption(message.message),
      });
    }

    await this.prisma.historyChat.create({
      data: {
        jid: getJid(message),
        fromMe: message.key.fromMe,
        meta: message as any,
      },
    });

    return prompts;
  }

  async execute(socket: WASocket, message: WAMessage) {
    await this.clearHistoryIfMoreThanOneHour(socket, message);

    const messages = await this.getUserMessage(socket, message);
    const jid = getJid(message);

    await socket.presenceSubscribe(jid);
    await socket.sendPresenceUpdate('composing', jid);
    const chatgptResponse = await this.chatgptService.sendMessage(
      messages,
      // 'gpt-3.5-turbo',
      'gpt-4o',
    );

    await socket.sendPresenceUpdate('paused', jid);
    const messageResopnse = await socket.sendMessage(getJid(message), {
      text: whatsappFormat(chatgptResponse),
    });
    await this.prisma.historyChat.create({
      data: {
        jid: getJid(message),
        fromMe: true,
        meta: messageResopnse,
      },
    });
  }
}
