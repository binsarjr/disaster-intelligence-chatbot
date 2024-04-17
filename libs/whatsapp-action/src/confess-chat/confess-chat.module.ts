import { ConfessChatAction } from '@app/whatsapp-action/confess-chat/confess-chat.action';
import { ConfessRoomChatAsReceiverAction } from '@app/whatsapp-action/confess-chat/confess-room-chat-as-receiver.action';
import { ConfessRoomChatAsSenderAction } from '@app/whatsapp-action/confess-chat/confess-room-chat-as-sender.action';
import { StopconfessCommandAction } from '@app/whatsapp-action/confess-chat/stopconfess-command.action copy';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfessChatAction,
    ConfessRoomChatAsReceiverAction,
    ConfessRoomChatAsSenderAction,
    StopconfessCommandAction,
  ],
})
export class ConfessChatModule {}
