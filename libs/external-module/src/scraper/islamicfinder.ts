import { Injectable } from '@nestjs/common';
import { load } from 'cheerio';

@Injectable()
export class IslamicFinder {
  async countries(continent?: string) {
    const response = await fetch(
      'https://www.islamicfinder.org/world/?language=id',
    ).then((res) => res.text());
    const $ = load(response);
    const countries: {
      countryCode: string;
      continent: string;
      slug: string;
      title: string;
      countryName: string;
    }[] = [];

    const data = JSON.parse($('#countries-data').text());
    Object.keys(data).map((key) => {
      if (continent) {
        if (key != continent) return;
      }

      data[key].map((country) => {
        countries.push({
          countryCode: country.countryCode,
          continent: key,
          slug: country.slug,
          title: country.title,
          countryName: country.countryName,
        });
      });
    });

    return countries;
  }

  async getCountryId(countryName: string) {
    const body = await fetch(
      `https://www.islamicfinder.org/world/${countryName}/?language=id`,
    ).then((res) => res.text());
    // get from: ; var countryId = "1643084";
    const countryId = body.match(/var countryId = "(\d+)";/)?.[1];

    return countryId;
  }

  async getSchedule(countryName: string, cityName: string) {
    const countryId = await this.getCountryId(countryName);

    const response: {
      objects: {
        cityId: number;
        countryId: number;
        cityName: string;
        cityNameArabic: string;
        localeCode?: string;
        countryName: string;
        countryIsoCode: string;
        timezone: string;
        latitude: number;
        longitude: number;
        subDivision1Name: string;
        subDivision1Code: string;
        currentPrayer: null;
        countrySlug: string;
        citySlug: string;
      }[];
    } = await fetch(
      `https://www.islamicfinder.org/world/search-city?keyword=${cityName}&countryId=${countryId}&page=1`,
    ).then((res) => res.json());

    if (response.objects.length == 0) return null;

    const body = await fetch(
      `https://www.islamicfinder.org/world/${countryName}/${response.objects[0].cityId}/${response.objects[0].citySlug}?language=id`,
      {
        headers: {
          'Accept-Language': 'id-ID',
          cookie: 'myLocaleCookie=id; ',
        },
      },
    ).then((res) => res.text());

    const $ = load(body);

    const results: {
      prayerName: string;
      prayerTime: string;
    }[] = [];

    $('.prayerTiles').each((index, element) => {
      results.push({
        prayerName: $(element).find('.prayername').text(),
        prayerTime: $(element).find('.prayertime').text(),
      });
    });

    return results;
  }
}
