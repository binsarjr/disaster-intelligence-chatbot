import { CekResiAction } from '@app/whatsapp-action/tools/cekresi/cekresi.action';
import { JneAction } from '@app/whatsapp-action/tools/cekresi/jne.action';
import { TikiAction } from '@app/whatsapp-action/tools/cekresi/tiki.action';
import { Module } from '@nestjs/common';

@Module({
  providers: [JneAction, TikiAction, CekResiAction],
})
export class CekresiModule {}
