import { Module, type DynamicModule } from '@nestjs/common';

@Module({})
export class ExternalModuleModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: ExternalModuleModule,
      imports: [],
      providers: [],
      exports: [],
    };
  }
}
