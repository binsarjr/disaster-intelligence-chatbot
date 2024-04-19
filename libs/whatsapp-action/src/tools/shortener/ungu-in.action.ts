import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { randomInteger } from 'src/supports/number.support';
import { uid } from 'uid';

@WhatsappMessage({
  flags: [withSign('unguin'), withSignRegex('unguin .*')],
})
export class UnguInAction extends WhatsappMessageAction {
  async shorten(original: string, shorten?: string) {
    shorten ||= uid(6);
    const ip = `127.${randomInteger(0, 99)}.${randomInteger(0, 99)}.${randomInteger(0, 999)}`;

    const result: Partial<{
      data: {
        id: number;
        domain_id: number;
        original: string;
        shorten: string;
        ip: string;
        updatedAt: string;
        createdAt: string;
      };
      message:
        | string
        | {
            message: string;
          }[];
    }> = await fetch('https://api.ungu.in/api/v1/links/for-guest', {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'id-ID,id;q=0.9',
        'content-type': 'application/json',
        'sec-ch-ua':
          '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        // bypass rate limit ip using header
        'x-forwarded-for': ip,
        'x-forwarded-host': ip,
        'x-client-ip': ip,
        'x-real-ip': ip,
        'x-remote-ip': ip,
        'x-real-ip-remote': ip,
        'X-Remote-Addr': ip,
        'X-Originating-IP': ip,
        'X-Forwarded-For': ip,
        'X-Remote-IP': ip,
        'X-Client-IP': ip,
        'X-Host': ip,
        'X-Forwared-Host': ip,
      },
      referrer: 'https://app.ungu.in/',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: JSON.stringify({ original: original, shorten: shorten || uid(6) }),
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
    }).then((res) => res.json());

    if (result?.data) {
      return {
        success: true,
        data: result.data,
      };
    }

    if (typeof result?.message === 'string') {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: false,
      message: result.message[0].message,
    };
  }

  async execute(socket: WASocket, message: WAMessage) {
    const [_, one, two] = getMessageCaption(message.message).split(/\s+/, 3);

    let url = one;
    let shorten = null;
    if (two) {
      url = two;
      shorten = one;
    }
    this.reactToProcessing(socket, message);

    const result = await this.shorten(url, shorten);

    if (result.success) {
      await socket.sendMessage(
        message.key.remoteJid!,
        {
          text: `
Shorten Ungu.in berhasil dibuat

Shorten: http://ungu.in/${result.data.shorten}
Original: ${result.data.original}
          `.trim(),
          contextInfo: {
            externalAdReply: {
              showAdAttribution: true,
              title: 'Ungu.in',
              body: result.data.original,
              sourceUrl: result.data.original,
            },
          },
        },
        { quoted: message },
      );
      this.reactToDone(socket, message);
    } else {
      await socket.sendMessage(
        message.key.remoteJid!,
        {
          text: result.message,
        },
        { quoted: message },
      );
      this.reactToFailed(socket, message);
    }
  }
}
