import { MediaSaver } from '@app/external-module/mediasaver';
import { Module, type DynamicModule } from '@nestjs/common';

@Module({})
export class ExternalModuleModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: ExternalModuleModule,
      imports: [],
      providers: [MediaSaver],
      exports: [MediaSaver],
    };
  }
}
