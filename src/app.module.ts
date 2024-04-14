import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module } from '@nestjs/common';

import { ExternalModuleModule } from '@app/external-module/external-module.module';
import { PrismaModule } from '@app/prisma';
import { WhatsappActionModule } from '@app/whatsapp-action';
import { WhatsappModule } from '@app/whatsapp/whatsapp.module';

@Module({
  imports: [
    DiscoveryModule,
    ExternalModuleModule.forRoot(),
    PrismaModule.forRoot(),
    WhatsappModule.forRoot(),
    WhatsappActionModule,
  ],
  providers: [],
})
export class AppModule {}
