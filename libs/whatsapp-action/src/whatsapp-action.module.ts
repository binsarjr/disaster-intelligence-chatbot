import { RejectCallAction } from '@app/whatsapp-action/always-executed/spam/reject-call.action';
import { InstagramDownloaderAction } from '@app/whatsapp-action/downloader/instagram-downloader.action';
import { TiktokDownloaderAction } from '@app/whatsapp-action/downloader/tiktok-downloader.action';
import { AddMemberAction } from '@app/whatsapp-action/group/add-member.action';
import { DemoteMemberAction } from '@app/whatsapp-action/group/demote-member.action';
import { KickMemberAction } from '@app/whatsapp-action/group/kick-member.action';
import { MentionAdminAction } from '@app/whatsapp-action/group/mention-admin.action';
import { MentionAllAction } from '@app/whatsapp-action/group/mention-all.action';
import { MentionMemberAction } from '@app/whatsapp-action/group/mention-member.action';
import { PromoteMemberAction } from '@app/whatsapp-action/group/promote-member.action';
import { ConvertToHDAction } from '@app/whatsapp-action/random/convert-to-hd.action';
import { ImgToStickerAction } from '@app/whatsapp-action/random/img-to-sticker.action';
import { PingAction } from '@app/whatsapp-action/random/ping.action';
import { StickerToImgAction } from '@app/whatsapp-action/random/sticker-to-img.action';
import { ScanQrCodeAction } from '@app/whatsapp-action/scan-qr-code.action';
import { Module } from '@nestjs/common';

@Module({
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

    // downloader
    InstagramDownloaderAction,
    TiktokDownloaderAction,

    RejectCallAction,
  ],
})
export class WhatsappActionModule {}
