import { ManualJS } from '@app/external-module/cekresei/merge';
import { JNEParser } from '@app/external-module/cekresei/parser/jne.parser';
import { TikiParser } from '@app/external-module/cekresei/parser/tiki.parser';
import { Injectable } from '@nestjs/common';

type Ekspedisi = 'JNE' | 'TIKI';

@Injectable()
export class CekResi {
  async checkAll(awb) {
    return await Promise.any([this.tiki(awb), this.jne(awb)]);
  }

  async jne(awb: string) {
    const body = await this.check(awb, 'JNE');
    if (!body) return null;

    return new JNEParser().parse(awb, body);
  }

  async tiki(awb: string) {
    const body = await this.check(awb, 'TIKI');
    if (!body) return null;

    return new TikiParser().parse(awb, body);
  }

  protected async check(awb: string, ekspedisi: Ekspedisi) {
    // const { viewstate, secret_key } = await this.getState();

    awb = (awb = awb.toUpperCase()).replace(/ /g, '');
    let a = ManualJS.jun.Des.parse('79540e250fdb16afac03e19c46dbdeb3');
    let s = ManualJS.jun.Des.parse('eb2bb9425e81ffa942522e4414e95bd0');
    let i = ManualJS.MDX.goinstring(awb, a, { ii: s });
    i = i.rabbittext.toString(ManualJS.jun.Text21);

    const url = `https://apix3.cekresi.com/cekresi/resi/initialize.php?ui=e55223bde11a185494bf1eea3e11f43f&p=1&w=${Math.random().toString(36).substring(7)}`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.160 Safari/537.36' +
          Math.random().toString(36),
        Origin: 'https://cekresi.com',
        Referer: 'https://cekresi.com/',
      },
      body: new URLSearchParams({
        viewstate: '',
        secret_key: '',
        e: ekspedisi,
        noresi: awb,
        timers: i,
      }),
    });

    if (!resp.ok) return null;

    return await resp.text();
  }

  // protected async getState() {
  //   const body = await fetch('https://cekresi.com/').then((res) => res.text());

  //   const $ = load(body);

  //   return {
  //     viewstate: $('input#viewstate').val(),
  //     secret_key: $('input#secret_key').val(),
  //   };
  // }

  // protected async init(awb: string) {
  //   await fetch(
  //     `https://cektarif.com/resi/initialize_exp.php?r=${awb}&p=1&w=${Math.random().toString(36).substring(7)}`,
  //     {
  //       headers: {
  //         Host: 'cektarif.com',
  //         'Sec-Ch-Ua': '"Chromium";v="121", "Not A(Brand";v="99"',
  //         Accept: '*/*',
  //         'Sec-Ch-Ua-Mobile': '?0',
  //         'User-Agent':
  //           'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.160 Safari/537.36',
  //         'Sec-Ch-Ua-Platform': '"macOS"',
  //         Origin: 'https://cekresi.com',
  //         'Sec-Fetch-Site': 'cross-site',
  //         'Sec-Fetch-Mode': 'cors',
  //         'Sec-Fetch-Dest': 'empty',
  //         Referer: 'https://cekresi.com/',
  //         'Accept-Encoding': 'gzip, deflate, br',
  //         'Accept-Language': 'en-US,en;q=0.9',
  //         Priority: 'u=1, i',
  //       },
  //     },
  //   );
  // }
}
