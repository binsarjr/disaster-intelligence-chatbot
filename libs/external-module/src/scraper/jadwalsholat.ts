import { load } from 'cheerio';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export class Jadwalsholat {
  async schedule(cityId: string) {
    const response = await fetch(
      `https://jadwalsholat.org/jadwal-sholat/monthly.php?id=${cityId}`,
    ).then((res) => res.text());
    const $ = load(response);

    const date = (day: string | number) => {
      let date = dayjs.tz(new Date(), 'Asia/Jakarta');
      date = date.set('date', +day);

      return date.format('YYYY-MM-DD');
    };

    const hariini = (() => {
      const element = $('tr.table_highlight');

      return {
        Tanggal: date(+$(element).find('td').eq(0).text()),
        Waktu: {
          Imsyak: $(element).find('td').eq(1).text(),
          Shubuh: $(element).find('td').eq(2).text(),
          Terbit: $(element).find('td').eq(3).text(),
          Dhuha: $(element).find('td').eq(4).text(),
          Dzuhur: $(element).find('td').eq(5).text(),
          Ashr: $(element).find('td').eq(6).text(),
          Maghrib: $(element).find('td').eq(7).text(),
          Isya: $(element).find('td').eq(8).text(),
        },
      };
    })();

    const bulanini: (typeof hariini)[] = [];

    const parameter = {
      koordinat: '',
      arah: '',
      jarak: '',
    };

    $('.table_adzan  tr').each((index, element) => {
      if (
        $(element).hasClass('table_light') ||
        $(element).hasClass('table_dark') ||
        $(element).hasClass('table_highlight')
      ) {
        bulanini.push({
          Tanggal: date(+$(element).find('td').eq(0).text()),
          Waktu: {
            Imsyak: $(element).find('td').eq(1).text(),
            Shubuh: $(element).find('td').eq(2).text(),
            Terbit: $(element).find('td').eq(3).text(),
            Dhuha: $(element).find('td').eq(4).text(),
            Dzuhur: $(element).find('td').eq(5).text(),
            Ashr: $(element).find('td').eq(6).text(),
            Maghrib: $(element).find('td').eq(7).text(),
            Isya: $(element).find('td').eq(8).text(),
          },
        });
        return;
      }

      if ($(element).text().includes('Untuk Kota')) {
        parameter.koordinat = $(element)
          .find('td')
          .eq(0)
          .html()
          .replace(/^.+<\/b>/g, '')
          .trim();
        return;
      }

      const col1 = $(element).find('td').eq(0).text();
      if (col1.includes('Arah')) {
        parameter.arah = $(element).find('td').eq(1).text().trim();
        return;
      }
      if (col1.includes('Jarak')) {
        parameter.jarak = $(element).find('td').eq(1).text().trim();
        return;
      }
    });

    return { hariini, bulanini, parameter };
  }

  async cities() {
    const response = await fetch(
      'https://jadwalsholat.org/jadwal-sholat/monthly.php',
    ).then((res) => res.text());
    const $ = load(response);
    const cities: {
      cityId: string;
      cityName: string;
    }[] = [];

    $('option').each((index, element) => {
      cities.push({
        cityId: $(element).attr('value'),
        cityName: $(element).text(),
      });
    });

    return cities;
  }

  async search(cityName: string) {
    const cities = await this.cities();
    return cities.filter((city) =>
      city.cityName.toLowerCase().includes(cityName.toLowerCase()),
    );
  }
}
