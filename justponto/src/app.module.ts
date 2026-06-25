import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { DataModule } from './data/data.module';
import { AuthModule } from './auth/auth.module';
import { TiposOcorrenciaModule } from './tipos-ocorrencia/tipos-ocorrencia.module';
import { JustificativasModule } from './justificativas/justificativas.module';
import { AnexosModule } from './anexos/anexos.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MockStorageModule } from './mock-storage/mock-storage.module';
import { HealthModule } from './health/health.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DataModule,
    AuthModule,
    TiposOcorrenciaModule,
    JustificativasModule,
    AnexosModule,
    RelatoriosModule,
    UsuariosModule,
    MockStorageModule,
    HealthModule,
  ],
  providers: [
    // JwtAuthGuard global: bloqueia toda rota sem token (exceto @Public)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // RolesGuard global: bloqueia rotas que exigem perfil específico
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
