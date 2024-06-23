import { RejectCallAction } from '@app/whatsapp-action/always-executed/spam/reject-call.action';
import { ScanQrCodeAction } from '@app/whatsapp-action/scan-qr-code.action';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [ScanQrCodeAction, RejectCallAction],
})
export class WhatsappActionModule {}
