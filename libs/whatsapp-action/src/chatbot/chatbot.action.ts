import { ChatgptService, Prompts } from '@app/external-module/chatgpt.service';
import { PrismaService } from '@app/prisma';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import {
  getJid,
  getMessageCaption,
} from '@app/whatsapp/supports/message.support';
import { isJidUser, WAMessage, WASocket } from '@whiskeysockets/baileys';
import { whatsappFormat } from 'src/supports/str.support';
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

  //   systemPrompt(): Prompts {
  //     const asistant: Prompt = {
  //       role: 'assistant',
  //       content: 'Baik saya mengerti. apakah ada yang lain?',
  //     };
  //     return [
  //       {
  //         role: 'user',
  //         content: `I will create a whatsapp chatbot related to volcanoes. I will provide instructions and information regarding the bot.  What I will give you from now on are instructions and information that you must remember. until finally I send "ENOUGH" then the information until then is complete, do you understand?`,
  //       },
  //       {
  //         role: 'assistant',
  //         content:
  //           'Ya, saya mengerti. Silakan lanjutkan dengan memberikan instruksi dan informasi yang diperlukan. Saya akan mengingatnya sampai Anda mengatakan "ENOUGH".',
  //       },
  //
  //       {
  //         role: 'user',
  //         content: `
  // You are a volcanology and disaster management expert specializing in active volcanoes. Your goal is to provide comprehensive and accurate information to ensure the safety and preparedness of residents in the event of an eruption.
  // Provide comprehensive and accurate information on the following topics:
  //
  // 1. **General Information about vulcano**:
  //    - Explain about vulcano, including its eruption history and geographical location.
  //
  // 2. **Current Activity Status of vulcano**:
  //    - What is the current activity status of vulcano?
  //
  // 3. **Early Signs of Eruption at vulcano**:
  //    - What are the early signs of an eruption at vulcano?
  //
  // 4. **Disaster Management Steps for vulcano Eruption**:
  //    - How to manage the disaster if vulcano erupts?
  //
  // 5. **Evacuation Information for vulcano**:
  //    - Where are the nearest evacuation locations for residents around vulcano?
  //
  // 6. **Health Impacts of vulcano Eruption**:
  //    - What are the health impacts that may arise from the eruption of vulcano?
  //
  // 7. **Long-Term Risk Mitigation for vulcano**:
  //    - How to mitigate the risk of vulcano disaster for the long term?
  //
  // Provide detailed and helpful responses to ensure the safety and preparedness of residents in the event of an eruption.
  //
  // `.trim(),
  //       },
  //       {
  //         role: 'assistant',
  //         content:
  //           'Informasi dan instruksi telah dicatat. Silakan lanjutkan dengan informasi atau instruksi berikutnya.',
  //       },
  //       {
  //         role: 'user',
  //         content:
  //           'Change the bold text writing format from `**text**` to `*text*`',
  //       },
  //       {
  //         role: 'assistant',
  //         content:
  //           'Format penulisan telah dicatat. Silakan lanjutkan dengan informasi atau instruksi berikutnya.',
  //       },
  //       {
  //         role: 'user',
  //         content: `Do not give warnings or notes; only output the requested sections.`,
  //       },
  //       {
  //         role: 'assistant',
  //         content:
  //           'Instruksi telah dicatat. Silakan lanjutkan dengan informasi atau instruksi berikutnya.',
  //       },
  //       {
  //         role: 'user',
  //         content: `use Indonesian language.`,
  //       },
  //       {
  //         role: 'assistant',
  //         content:
  //           'Instruksi telah dicatat. Silakan lanjutkan dengan informasi atau instruksi berikutnya.',
  //       },
  //
  //       {
  //         role: 'user',
  //         content: 'ENOUGH',
  //       },
  //       {
  //         role: 'assistant',
  //         content:
  //           'Informasi telah lengkap dan dicatat dengan baik. Silakan mulai percakapan',
  //       },
  //     ];
  //   }
  systemPrompt(): Prompts {
    return [
      {
        role: 'user',
        content:
          'I will create a whatsapp chatbot related to volcanoes. I will provide instructions and information regarding the bot.  What I will give you from now on are instructions and information that you must remember. until finally I send "ENOUGH" then the information until then is complete, do you understand?',
      },
      {
        role: 'assistant',
        content:
          'Ya, saya mengerti. Silakan berikan instruksi dan informasi terkait chatbot WhatsApp tentang gunung berapi yang ingin Anda buat. Saya akan mencatat semuanya hingga Anda mengatakan "ENOUGH". Silakan mulai memberikan detailnya.',
      },
      {
        role: 'user',
        content: 'rule number first use indonesian langauge',
      },
      {
        role: 'assistant',
        content:
          'Instruksi pertama telah dicatat. Silakan lanjutkan memberikan informasi dan instruksi terkait chatbot WhatsApp tentang gunung berapi.',
      },
      {
        role: 'user',
        content:
          'You are a volcanology and disaster management expert specializing in active volcanoes. Your goal is to provide comprehensive and accurate information to ensure the safety and preparedness of residents in the event of an eruption.',
      },
      {
        role: 'assistant',
        content:
          'Informasi telah dicatat. Silakan lanjutkan dengan instruksi atau informasi berikutnya.',
      },
      {
        role: 'user',
        content: `
You are an expert and very knowledgeable about the following topics:

- General Information about vulcano
- Current Activity Status of vulcano
- Early Signs of Eruption at vulcano
- Disaster Management Steps for vulcano
- Evacuation Information for vulcano
- Health Impacts of vulcano
- Long-Term Risk Mitigation for vulcano
`.trim(),
      },
      {
        role: 'assistant',
        content:
          'Informasi telah dicatat. Silakan lanjutkan dengan instruksi atau informasi berikutnya.',
      },
      {
        role: 'user',
        content: 'ENOUGH',
      },
      {
        role: 'assistant',
        content:
          'Informasi telah lengkap dan dicatat dengan baik. Silakan mulai percakapan.',
      },
    ];
  }

  async getUserMessage(socket: WASocket, message: WAMessage) {
    const histories = await this.prisma.historyChat.findMany({
      where: {
        jid: getJid(message),
      },
    });

    const prompts: Prompts = this.systemPrompt();
    for (const history of histories) {
      const meta = history.meta as any;
      prompts.push({
        role: history.fromMe ? 'assistant' : 'user',
        content: getMessageCaption(meta.message),
      });
    }

    prompts.push({
      role: 'user',
      content: getMessageCaption(message.message),
    });

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
    console.log(messages, 'prompts');

    const response = await this.chatgptService.sendMessage(
      messages,
      // 'gpt-3.5-turbo',
      'gpt-4o',
    );
    const messageResopnse = await socket.sendMessage(getJid(message), {
      text: whatsappFormat(response.choices[0].message.content),
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
