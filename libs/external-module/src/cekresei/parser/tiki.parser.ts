import type {
  CekresiParser,
  CekresiResult,
} from '@app/external-module/cekresei/cekresi.interface';
import { ReadMoreUnicode } from '@app/whatsapp/constants';
import { load } from 'cheerio';

export class TikiParser implements CekresiParser {
  parse(awb: string, body: string): CekresiResult {
    if (!body.includes('Expedisi TIKI')) return null;
    const $ = load(body);
    $('br').replaceWith(' - ');

    let information: string[] = [];

    $('table')
      .eq(0)
      .find('tr')
      .each((index, element) => {
        const key = $(element).find('td').eq(0).text().trim();
        const value = $(element).find('td').eq(2).text().trim();

        if (
          [
            'Service',
            'Dikirim tanggal',
            'Dikirim dari',
            'Dikirim ke',
            'TIKI Status',
          ].includes(key)
        )
          information.push(`${key}: ${value}`);
      });

    let history: string[] = [];
    $('table')
      .eq(1)
      .find('tr')
      .each((index, element) => {
        const tanggal = $(element).find('td').eq(0).text().trim();
        const lokasi = $(element).find('td').eq(1).text().trim();
        const status = $(element).find('td').eq(2).text().trim();
        if (!tanggal) return;
        history.push(
          `
Waktu: ${tanggal}
Keterangan: ${lokasi}
Status: ${status}
        `.trim(),
        );
      });

    const status = $('#status_resi').text().trim();
    if (!status) return null;
    return {
      text: `
*Expedisi TIKI*
    
*Informasi Pengiriman:*
No Resi: ${awb}
Status: ${status}
Posisi Terakhir: ${$('#last_position').text().trim()}

${information.join('\n')}

${ReadMoreUnicode}
*History:*
${history.reverse().join('\n↓\n')}


    
    `.trim(),
      thumbnail: 'https://www.tikibanjarmasin.com/images/Logo-TIKI.png',
      name: 'TIKI',
    };
  }
}
