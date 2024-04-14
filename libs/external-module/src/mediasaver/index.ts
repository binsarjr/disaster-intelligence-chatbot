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
  async bravedown(url: string) {
    const response = await fetch(
      this.baseUrl + 'bravedown/tiktok-downloader?url=' + url,
    );

    return response.json();
  }

  async saveTube(identifier: string) {
    const response = await fetch(
      this.baseUrl + 'savetube?identifier=' + identifier,
    );

    return response.json();
  }

  async ytmate(url: string) {
    const response = await fetch(this.baseUrl + 'yt2mate?url=' + url);

    return response.json();
  }
}
