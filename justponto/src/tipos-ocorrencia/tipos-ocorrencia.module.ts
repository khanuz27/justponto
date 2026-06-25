import { Module } from '@nestjs/common';
import { TiposOcorrenciaService } from './tipos-ocorrencia.service';
import { TiposOcorrenciaController } from './tipos-ocorrencia.controller';
import { DataModule } from '../data/data.module';

@Module({
  imports: [DataModule],
  controllers: [TiposOcorrenciaController],
  providers: [TiposOcorrenciaService],
  exports: [TiposOcorrenciaService],
})
export class TiposOcorrenciaModule {}
