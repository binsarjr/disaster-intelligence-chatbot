import { Module, type DynamicModule } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';

@Module({})
export class ExternalModuleModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: ExternalModuleModule,
      imports: [],
      providers: [ChatgptService],
      exports: [ChatgptService],
    };
  }
}
