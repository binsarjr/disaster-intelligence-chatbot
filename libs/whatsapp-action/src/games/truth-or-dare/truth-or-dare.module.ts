import { DareAction } from '@app/whatsapp-action/games/truth-or-dare/dare.action';
import { TruthAction } from '@app/whatsapp-action/games/truth-or-dare/truth.action';
import { Module } from '@nestjs/common';

@Module({
  imports: [TruthAction, DareAction],
})
export class TruthOrDareModule {}
