import { StartAnonymousChatAction } from '@app/whatsapp-action/anonymous-chat/start-anonymous-chat.action';
import { Module } from '@nestjs/common';

@Module({
  providers: [StartAnonymousChatAction],
})
export class AnonymousChatModule {}
