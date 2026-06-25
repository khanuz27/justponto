import { Module } from '@nestjs/common';
import { AnexosService } from './anexos.service';
import { AnexosController } from './anexos.controller';
import { DataModule } from '../data/data.module';

@Module({
  imports: [DataModule],
  controllers: [AnexosController],
  providers: [AnexosService],
  exports: [AnexosService],
})
export class AnexosModule {}
