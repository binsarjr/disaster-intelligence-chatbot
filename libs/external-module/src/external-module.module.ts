import { MediaSaver } from '@app/external-module/mediasaver';
import { IslamicFinder } from '@app/external-module/scraper/islamicfinder';
import { Module, type DynamicModule } from '@nestjs/common';

@Module({})
export class ExternalModuleModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: ExternalModuleModule,
      imports: [],
      providers: [MediaSaver, IslamicFinder],
      exports: [MediaSaver, IslamicFinder],
    };
  }
}
