import { WhatsappConnectionService } from '@app/whatsapp/core/whatsapp-connection.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { TwitterOpenApi } from 'twitter-openapi-typescript';
import * as fs from 'fs';
import { sleep } from 'src/supports/time.support';

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
    private readonly whatsappConnectionService: WhatsappConnectionService,
  ) {}

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
      } catch (error) {
        console.error('TweetUpdateJob', error);
      }

      await sleep(2000);
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
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    console.log(JSON.stringify(data, null, 2));

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
