import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { DataModule } from '../data/data.module';

@Module({
  imports: [DataModule],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
