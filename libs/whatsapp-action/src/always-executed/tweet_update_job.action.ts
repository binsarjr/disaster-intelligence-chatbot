import { Injectable, OnModuleInit } from '@nestjs/common';
import { TwitterOpenApi } from 'twitter-openapi-typescript';
import * as fs from 'fs';
import { sleep } from 'src/supports/time.support';
import { PrismaService } from '@app/prisma';
import { WhatsappStoreService } from '@app/whatsapp/core/whatsapp-store.service';
import { randomInt } from 'crypto';
import { Logger } from '@services/logger';

interface TweetAccount {
  ct0: string;
  auth_token: string;
  reset_time: Date;
}

@Injectable()
export class TweetUpdateJob implements OnModuleInit {
  private _twitterAccounts: TweetAccount[] = [];
  private _currentAccountIndex = 0;
  private currentAccount: TweetAccount | null;

  private userRestId: string = '';
  private logger = Logger({ name: 'TweetUpdateJob' });

  constructor(
    private readonly whatsappStoreService: WhatsappStoreService,
    private readonly prisma: PrismaService,
  ) {}

  async loadSocket() {
    const devices = await this.prisma.device.findMany();

    for (const device of devices) {
      const socket = this.whatsappStoreService.get(device.id);
      if (socket) {
        return socket;
      }
    }
    return null;
  }

  async loadAccount() {
    const twitter = JSON.parse(
      await fs.promises.readFile('akun_twitter.json', 'utf-8'),
    );

    return twitter as TweetAccount[];
  }

  async rotateAccount() {
    this._currentAccountIndex =
      (this._currentAccountIndex + 1) % this._twitterAccounts.length;
    this.currentAccount = this._twitterAccounts[this._currentAccountIndex];
    if (this.currentAccount.reset_time < new Date()) {
      this.logger.info('Reset time is expired, rotating account');
      await this.rotateAccount();
    }
  }

  async onModuleInit() {
    this._twitterAccounts = await this.loadAccount();
    await this.rotateAccount();
    await this.loadUserRestId();

    setTimeout(async () => {
      while (true) {
        try {
          const groups = await this.prisma.groupChat.findMany();
          if (!groups.length) {
            this.logger.info('No group chat is configured');
            continue;
          }
          const latestTweet = await this.getLatestTweets();

          const lastAnnoucement =
            await this.prisma.historyAnnouncement.findFirst({
              orderBy: {
                createdAt: 'desc',
              },
            });

          if (lastAnnoucement) {
            if (lastAnnoucement.id == latestTweet?.restId) {
              this.logger.info('Tidak ada update');
              continue;
            }
          }

          const socket = await this.loadSocket();
          if (socket) {
            for (const group of groups) {
              const text = `
*Annoucment!!!*

${latestTweet?.legacy?.fullText}

`.trim();
              await socket.socket.sendMessage(group.jid, {
                text,
              });

              await sleep(randomInt(2000, 5000));
            }

            await this.prisma.historyAnnouncement.create({
              data: {
                text: latestTweet?.legacy.fullText,
                meta: latestTweet as any,
                id: latestTweet?.restId,
              },
            });
          }
        } catch (error) {
          console.error('TweetUpdateJob', error);
        } finally {
          await sleep(5000);
        }
      }
    }, 1_000);
  }

  async loadUserRestId() {
    const api = new TwitterOpenApi();

    const client = await api.getClientFromCookies({
      ct0: this.currentAccount.ct0,
      auth_token: this.currentAccount.auth_token,
    });

    const user = await client
      .getUserApi()
      .getUserByScreenName({ screenName: process.env.X_USERNAME });

    this.userRestId = user.data.user?.restId || '';
  }

  async getLatestTweets() {
    await this.rotateAccount();
    try {
      const api = new TwitterOpenApi();

      const client = await api.getClientFromCookies({
        ct0: this.currentAccount.ct0,
        auth_token: this.currentAccount.auth_token,
      });

      const response: any = await client.getTweetApi().getUserTweets({
        userId: this.userRestId,
      });

      const data = response.data as TweetResult;

      // get latest tweets
      const entries = data.raw.instruction!.filter((type) =>
        Object.keys(type).includes('entries'),
      )[0].entries!;
      const tweets = entries.filter(
        (entry) => entry.content.typename === 'TimelineTimelineItem',
      );

      if (tweets.length === 0) {
        this.logger.warn('Tidak ada tweet yang ditemukan.');
        // return;
      }

      // Mengurutkan tweet berdasarkan 'sortIndex' untuk menemukan tweet terbaru
      tweets.sort((a, b) => (b.sortIndex as any) - (a.sortIndex as any));

      // Mendapatkan tweet terbaru
      const latestTweet = tweets[0].content.itemContent?.tweetResults?.result;

      return latestTweet;
    } catch (e) {
      const resetTime = e.response.headers.get('x-rate-limit-reset');
      if (resetTime) {
        const resert = new Date(+resetTime * 1000);
        this._twitterAccounts[this._currentAccountIndex].reset_time = resert;
      }
      throw e;
    }
  }
}
