import { Injectable } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class MediaSaver {
  private readonly baseUrl = 'https://mediasaver.binsarjr.com/services/';

  /**
   * Facebook Downloader from fdownloader
   */
  async fDownloader(url: string) {
    const response = await fetch(
      this.baseUrl + 'facebook/downloader?url=' + url,
    );

    const schema = z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.object({
        vidoes: z.array(
          z.object({
            quality: z.string(),
            url: z.string(),
          }),
        ),
      }),
    });

    return schema.parse(await response.json());
  }

  /**
   * tiktok Downloader from snaptik
   */
  async snaptik(url: string) {
    const response = await fetch(this.baseUrl + 'tiktok/snaptik?url=' + url);

    const schema = z.object({
      video: z.string(),
      images: z.array(z.string()),
    });

    return schema.parse(await response.json());
  }

  /**
   * Instagram Downloader from instagram-downloader
   */
  async instagramDownloader(url: string) {
    const response = await fetch(this.baseUrl + 'igdownloader?url=' + url);

    const schema = z.object({
      success: z.boolean(),
      data: z.array(
        z.object({
          thumb: z.string(),
          url: z.string(),
          is_video: z.boolean(),
        }),
      ),
    });
    return schema.parse(await response.json());
  }

  /**
   * TikTok Downloader from bravedown
   */
  async bravedown(
    url: string,
    identifier: 'tiktok-downloader' | 'twitter-video-downloader',
  ) {
    const response = await fetch(
      this.baseUrl + `bravedown/${identifier}?url=` + url,
    );

    const schema = z.object({
      success: z.boolean(),
      data: z.object({
        source: z.string(),
        title: z.string(),
        thumbnail: z.string(),
        duration: z.string().optional(),
        links: z.array(
          z.object({
            url: z.string(),
            type: z.string(),
            file: z.string(),
            quality: z.string(),
            mute: z.boolean(),
          }),
        ),
      }),
    });
    const data = await response.json();

    return schema.parse(data);
  }

  async saveTube(link: string, identifier: 'downloadAudio') {
    const response = await fetch(
      this.baseUrl + `savetube/${identifier}?identifier=` + link,
    );

    const schema = z.object({
      data: z.object({
        url: z.string(),
      }),
    });

    const data = await response.json();

    return schema.parse(data);
  }

  async ytmate(url: string) {
    const response = await fetch(this.baseUrl + 'yt2mate?url=' + url);

    return response.json();
  }
}
