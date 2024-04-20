import { load } from 'cheerio';

export class JNE {
  async cekresi(awb: string) {
    const resp = await fetch(`https://cekresi.jne.co.id/${awb}`, {
      headers: {
        Host: 'cekresi.jne.co.id',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.160 Safari/537.36',
        Referer: 'https://jne.co.id/',
      },
    });
    const body = await resp.text();
    const $ = load(body);

    const widgetDashboard = $('.dashboard-widget-content > .row > div');

    const shipmentService = widgetDashboard.eq(0).find('div').text().trim();
    const from = widgetDashboard.eq(1).find('div').text().trim();
    const to = widgetDashboard.eq(2).find('div').text().trim();
    const estimateDelivery = widgetDashboard.eq(3).find('div').text().trim();
    const podDate = widgetDashboard.eq(4).find('div').text().trim();

    if (!resp.ok || !from) return null;

    return {
      link: `https://cekresi.jne.co.id/${awb}`,
      awb,
      shipmentService,
      from,
      to,
      estimateDelivery,
      podDate,
      history: {
        receiver: this.historyReceiver($),
        histories: this.getHistory($),
      },
      shipmentDetail: this.shipmentDetail($),
    };
  }

  protected historyReceiver($: cheerio.Root) {
    const element = $('.dashboard-widget-content > :not(.row)').eq(1);
    return {
      name: element.find('h2').text().trim(),
      info: element.find('h4').text().trim(),
    };
  }

  protected getHistory($: cheerio.Root) {
    const history: {
      title: string;
      date: string;
    }[] = [];
    $('.timeline li').each((index, element) => {
      history.push({
        title: $(element).find('.title').text().trim(),
        date: $(element).find('.byline').text().trim(),
      });
    });

    return history;
  }

  protected shipmentDetail($: cheerio.Root) {
    const element = $('div.row > div').last().find('.x_panel > div');

    const total = element.length;

    const receiverCity = element
      .eq(total - 1)
      .find('h4')
      .text()
      .trim();
    const receiverName = element
      .eq(total - 2)
      .find('h4')
      .text();

    const shipperName = element
      .eq(total - 5)
      .find('h4')
      .text();

    const shipperCity = element
      .eq(total - 4)
      .find('h4')
      .text();

    return {
      shipmentDate: element.eq(1).find('h4').text().trim(),
      koli: element.eq(2).find('h4').text().trim(),
      weight: element.eq(3).find('h4').text().trim(),
      description: element.eq(4).find('h4').text().trim(),
      receiver: {
        city: receiverCity,
        name: receiverName,
      },
      shipper: {
        city: shipperCity,
        name: shipperName,
      },
    };
  }
}
