import { JNE } from '@app/external-module/cekresei/jne';
import { ReadMoreUnicode } from '@app/whatsapp/constants';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSignRegex('jne .*')],
})
export class JneAction extends WhatsappMessageAction {
  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);

    const jne = new JNE();
    const [_, ...resi] = getMessageCaption(message.message).split(/\s+/);
    await Promise.all(
      resi.map(async (resi) => {
        const result = await jne.cekresi(resi);
        if (!result) {
          await socket.sendMessage(
            message.key.remoteJid!,
            {
              text: 'Resi tidak ditemukan',
            },
            { quoted: message },
          );
          this.reactToFailed(socket, message);
          return;
        }

        let historyReceiver = '';

        if (result.history.receiver) {
          historyReceiver = `Receiver: ${result.history.receiver.name}\n${result.history.receiver.info}`;
        }

        await socket.sendMessage(
          message.key.remoteJid!,
          {
            text: `
RESI: ${result.awb}
SHIPMENT SERVICE: ${result.shipmentService}

FROM: ${result.from}
TO: ${result.to}

ESTIMATED DELIVERY: ${result.estimateDelivery}
POD DATE: ${result.podDate}

${ReadMoreUnicode}
HISTORY:

${historyReceiver}


TIMELINE:
${result.history.histories.map((history) => `${history.date} - ${history.title}`).join('\n↓\n')} 


${ReadMoreUnicode}
SHIPMENT DETAIL:
date: ${result.shipmentDetail.shipmentDate}
Koli: ${result.shipmentDetail.koli}
Weight: ${result.shipmentDetail.weight}

Description: 
${result.shipmentDetail.description}
            `.trim(),
            contextInfo: {
              externalAdReply: {
                showAdAttribution: true,
                title: 'CEKRESI - JNE',
                body: result.awb,
                sourceUrl: result.link,
                mediaType: 1,
                thumbnailUrl:
                  'https://play-lh.googleusercontent.com/2rj1RtJvFiIHdjgtR3JiwXieswJwYOd6eCT4F7pgi29-sZ43a_2nZKyfUd3KGBvJn5U',
                renderLargerThumbnail: true,
              },
            },
          },
          { quoted: message },
        );
        this.reactToDone(socket, message);
      }),
    );
  }
}
