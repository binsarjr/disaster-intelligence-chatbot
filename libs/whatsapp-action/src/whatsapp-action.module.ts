import { RejectCallAction } from '@app/whatsapp-action/always-executed/spam/reject-call.action';
import { ScanQrCodeAction } from '@app/whatsapp-action/scan-qr-code.action';
import { Module } from '@nestjs/common';
import { ChatbotAction } from './chatbot/chatbot.action';
import { GroupChatbotAction } from './chatbot/groupchatbot.action';
import { TweetUpdateJob } from './always-executed/tweet_update_job.action';
import { RegisterGroupAction } from './chatbot/registergroup.action';

@Module({
  imports: [],
  providers: [
    ScanQrCodeAction,
    RejectCallAction,
    ChatbotAction,

    GroupChatbotAction,

    // jobs
    TweetUpdateJob,
    RegisterGroupAction,
  ],
})
export class WhatsappActionModule {}
