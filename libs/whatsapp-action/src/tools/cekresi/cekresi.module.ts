import { JneAction } from '@app/whatsapp-action/tools/cekresi/jne.action';
import { Module } from '@nestjs/common';

@Module({
  providers: [JneAction],
})
export class CekresiModule {}
