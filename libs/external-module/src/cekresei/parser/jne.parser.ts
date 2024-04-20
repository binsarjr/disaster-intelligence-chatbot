import type {
  CekresiParser,
  CekresiResult,
} from '@app/external-module/cekresei/cekresi.interface';
import { ReadMoreUnicode } from '@app/whatsapp/constants';
import { load } from 'cheerio';

export class JNEParser implements CekresiParser {
  parse(awb: string, body: string): CekresiResult {
    if (!body.includes('Expedisi JNE Express')) return null;
    const $ = load(body);
    $('br').replaceWith(' - ');

    let information: string[] = [];
    console.log($.html());

    $('table')
      .eq(0)
      .find('tr')
      .each((index, element) => {
        const key = $(element).find('td').eq(0).text().trim();
        const value = $(element).find('td').eq(2).text().trim();

        if (key.includes('Dikirim')) information.push(`${key}: ${value}`);
      });

    let history: string[] = [];
    $('table')
      .eq(1)
      .find('tr')
      .each((index, element) => {
        const tanggal = $(element).find('td').eq(0).text().trim();
        const keterangan = $(element).find('td').eq(1).text().trim();

        if (!tanggal) return;
        history.push(
          `
Waktu: ${tanggal}
Keterangan: ${keterangan}

        `.trim(),
        );
      });
    const status = $('#status_resi').text().trim();
    if (!status) return null;
    return {
      text: `
*Expedisi JNE Express*

*Informasi Pengiriman:*
No Resi: ${awb}
Status: ${status}
Posisi Terakhir: ${$('#last_position').text().trim()}

${information.join('\n')}

${ReadMoreUnicode}
*History:*
${history.join('\n↓\n')}


    
    `.trim(),
      thumbnail:
        'https://play-lh.googleusercontent.com/2rj1RtJvFiIHdjgtR3JiwXieswJwYOd6eCT4F7pgi29-sZ43a_2nZKyfUd3KGBvJn5U',
      name: 'JNE',
    };
  }
}
