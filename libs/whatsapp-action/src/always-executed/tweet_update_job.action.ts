import { Injectable, OnModuleInit } from '@nestjs/common';
import { TwitterOpenApi } from 'twitter-openapi-typescript';
import * as fs from 'fs';
import { sleep } from 'src/supports/time.support';
import { PrismaService } from '@app/prisma';
import { WhatsappStoreService } from '@app/whatsapp/core/whatsapp-store.service';
import { randomInt } from 'crypto';

interface TweetAccount {
  ct0: string;
  auth_token: string;
}

@Injectable()
export class TweetUpdateJob implements OnModuleInit {
  private _twitterAccounts: TweetAccount[] = [];
  private _currentAccountIndex = 0;
  private currentAccount: TweetAccount | null;

  private userRestId: string = '';

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
  }

  async onModuleInit() {
    this._twitterAccounts = await this.loadAccount();
    await this.rotateAccount();
    await this.loadUserRestId();

    while (true) {
      try {
        const latestTweet = await this.getLatestTweets();
        console.log(latestTweet);
        console.log('Tweet Terbaru:');
        console.log(`Tweet ID: ${latestTweet?.restId}`);
        console.log(`Teks: ${latestTweet?.legacy.fullText}`);
        console.log(`Tanggal Dibuat: ${latestTweet?.legacy.createdAt}`);

        const lastAnnoucement = await this.prisma.historyAnnouncement.findFirst(
          {
            orderBy: {
              createdAt: 'desc',
            },
          },
        );

        if (lastAnnoucement) {
          if (lastAnnoucement.id == latestTweet?.restId) {
            console.log('Tidak ada update');
            continue;
          }
        }

        const groups = await this.prisma.groupChat.findMany();
        const socket = await this.loadSocket();
        if (socket) {
          for (const group of groups) {
            await socket.socket.sendMessage(group.jid, {
              text: latestTweet?.legacy.fullText,
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
      }

      await sleep(5000);
    }
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
      console.log('Tidak ada tweet yang ditemukan.');
      // return;
    }

    // Mengurutkan tweet berdasarkan 'sortIndex' untuk menemukan tweet terbaru
    tweets.sort((a, b) => (b.sortIndex as any) - (a.sortIndex as any));

    // Mendapatkan tweet terbaru
    const latestTweet = tweets[0].content.itemContent?.tweetResults?.result;

    return latestTweet;
  }
}
