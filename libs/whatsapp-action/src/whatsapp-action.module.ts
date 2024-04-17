import { RejectCallAction } from '@app/whatsapp-action/always-executed/spam/reject-call.action';
import { AnonymousChatModule } from '@app/whatsapp-action/anonymous-chat/anonymous-chat.module';
import { InstagramAudioDownloaderAction } from '@app/whatsapp-action/downloader/instagram-audio-downloader.action';
import { InstagramDownloaderAction } from '@app/whatsapp-action/downloader/instagram-downloader.action';
import { TiktokAudioDownloaderAction } from '@app/whatsapp-action/downloader/tiktok-audio-downloader.action';
import { TiktokDownloaderAction } from '@app/whatsapp-action/downloader/tiktok-downloader.action';
import { XDownloaderAction } from '@app/whatsapp-action/downloader/x-downloader.action';
import { YoutubeAudioDownloaderAction } from '@app/whatsapp-action/downloader/youtube-audio-downloader.action';
import { YoutubeDownloaderAction } from '@app/whatsapp-action/downloader/youtube-downloader.action';
import { TruthOrDareModule } from '@app/whatsapp-action/games/truth-or-dare/truth-or-dare.module';
import { AddMemberAction } from '@app/whatsapp-action/group/add-member.action';
import { DemoteMemberAction } from '@app/whatsapp-action/group/demote-member.action';
import { KickMemberAction } from '@app/whatsapp-action/group/kick-member.action';
import { MentionAdminAction } from '@app/whatsapp-action/group/mention-admin.action';
import { MentionAllAction } from '@app/whatsapp-action/group/mention-all.action';
import { MentionMemberAction } from '@app/whatsapp-action/group/mention-member.action';
import { PromoteMemberAction } from '@app/whatsapp-action/group/promote-member.action';
import { WelcomeCardAction } from '@app/whatsapp-action/group/welcome-card.action';
import { JadwalSholatAction } from '@app/whatsapp-action/information/jadwal-sholat.action';
import { SimpleMenuAction } from '@app/whatsapp-action/menus/simple-menu.action';
import { ConvertToHDAction } from '@app/whatsapp-action/random/convert-to-hd.action';
import { ImgToStickerAction } from '@app/whatsapp-action/random/img-to-sticker.action';
import { PingAction } from '@app/whatsapp-action/random/ping.action';
import { StickerToImgAction } from '@app/whatsapp-action/random/sticker-to-img.action';
import { ScanQrCodeAction } from '@app/whatsapp-action/scan-qr-code.action';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AnonymousChatModule,
    TruthOrDareModule,
    // ConfessChatModule
  ],
  providers: [
    ScanQrCodeAction,
    PingAction,
    ImgToStickerAction,
    StickerToImgAction,
    ConvertToHDAction,
    MentionAdminAction,
    MentionAllAction,
    MentionMemberAction,

    // group
    AddMemberAction,
    KickMemberAction,
    PromoteMemberAction,
    DemoteMemberAction,
    WelcomeCardAction,

    // downloader
    InstagramDownloaderAction,
    InstagramAudioDownloaderAction,
    TiktokDownloaderAction,
    TiktokAudioDownloaderAction,
    XDownloaderAction,
    YoutubeDownloaderAction,
    YoutubeAudioDownloaderAction,

    RejectCallAction,

    SimpleMenuAction,

    JadwalSholatAction,
  ],
})
export class WhatsappActionModule {}
