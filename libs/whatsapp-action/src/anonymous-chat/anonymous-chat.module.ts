import { StartAnonymousChatAction } from '@app/whatsapp-action/anonymous-chat/StartAnonymousChat.action';
import { Module } from '@nestjs/common';

@Module({
  providers: [StartAnonymousChatAction],
})
export class AnonymousChatModule {}
