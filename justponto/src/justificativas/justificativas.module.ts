import { Module } from '@nestjs/common';
import { JustificativasService } from './justificativas.service';
import { JustificativasController } from './justificativas.controller';
import { DataModule } from '../data/data.module';
import { AnexosModule } from '../anexos/anexos.module';

@Module({
  imports: [DataModule, AnexosModule],
  controllers: [JustificativasController],
  providers: [JustificativasService],
  exports: [JustificativasService],
})
export class JustificativasModule {}
