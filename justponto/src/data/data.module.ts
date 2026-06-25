import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Tokens de injeção (InjectionTokens)
export const USUARIOS_REPO        = 'USUARIOS_REPO';
export const TIPOS_OCORRENCIA_REPO = 'TIPOS_OCORRENCIA_REPO';
export const JUSTIFICATIVAS_REPO  = 'JUSTIFICATIVAS_REPO';
export const ANEXOS_REPO          = 'ANEXOS_REPO';
export const HISTORICO_REPO       = 'HISTORICO_REPO';
export const NOTIFICACOES_REPO    = 'NOTIFICACOES_REPO';
export const STORAGE_SERVICE      = 'STORAGE_SERVICE';
export const EMAIL_SERVICE        = 'EMAIL_SERVICE';

// Implementações mock
import { UsuariosMockRepositorio }        from './mock/usuarios.mock.repositorio';
import { TiposOcorrenciaMockRepositorio } from './mock/tipos-ocorrencia.mock.repositorio';
import { JustificativasMockRepositorio }  from './mock/justificativas.mock.repositorio';
import { AnexosMockRepositorio }          from './mock/anexos.mock.repositorio';
import { HistoricoMockRepositorio }       from './mock/historico.mock.repositorio';
import { NotificacoesMockRepositorio }    from './mock/notificacoes.mock.repositorio';
import { StorageMockService }             from './mock/storage.mock.service';
import { EmailFakeService }               from './mock/email.fake.service';

// Implementações Supabase
import { UsuariosSupabaseRepositorio }          from './supabase/usuarios.supabase.repositorio';
import { TiposOcorrenciaSupabaseRepositorio }   from './supabase/tipos-ocorrencia.supabase.repositorio';
import { JustificativasSupabaseRepositorio }    from './supabase/justificativas.supabase.repositorio';
import { AnexosSupabaseRepositorio }            from './supabase/anexos.supabase.repositorio';
import { HistoricoSupabaseRepositorio }         from './supabase/historico.supabase.repositorio';
import { NotificacoesSupabaseRepositorio }      from './supabase/notificacoes.supabase.repositorio';
import { StorageSupabaseService }               from './supabase/storage.supabase.service';

function criarProvedor(token: string, mockClass: any, supabaseClass?: any) {
  return {
    provide: token,
    useFactory: (config: ConfigService) => {
      const source = config.get<string>('DATA_SOURCE', 'mock');
      if (source === 'supabase' && supabaseClass) {
        return new supabaseClass(config);
      }
      return new mockClass();
    },
    inject: [ConfigService],
  };
}

@Module({
  imports: [ConfigModule],
  providers: [
    criarProvedor(USUARIOS_REPO,         UsuariosMockRepositorio,        UsuariosSupabaseRepositorio),
    criarProvedor(TIPOS_OCORRENCIA_REPO, TiposOcorrenciaMockRepositorio, TiposOcorrenciaSupabaseRepositorio),
    criarProvedor(JUSTIFICATIVAS_REPO,   JustificativasMockRepositorio,  JustificativasSupabaseRepositorio),
    criarProvedor(ANEXOS_REPO,           AnexosMockRepositorio,          AnexosSupabaseRepositorio),
    criarProvedor(HISTORICO_REPO,        HistoricoMockRepositorio,       HistoricoSupabaseRepositorio),
    criarProvedor(NOTIFICACOES_REPO,     NotificacoesMockRepositorio,    NotificacoesSupabaseRepositorio),
    criarProvedor(STORAGE_SERVICE,       StorageMockService,             StorageSupabaseService),
    criarProvedor(EMAIL_SERVICE,         EmailFakeService),
    // Permite injetar StorageMockService diretamente (mesma instância singleton)
    { provide: StorageMockService, useExisting: STORAGE_SERVICE },
  ],
  exports: [
    USUARIOS_REPO,
    TIPOS_OCORRENCIA_REPO,
    JUSTIFICATIVAS_REPO,
    ANEXOS_REPO,
    HISTORICO_REPO,
    NOTIFICACOES_REPO,
    STORAGE_SERVICE,
    EMAIL_SERVICE,
    StorageMockService,
  ],
})
export class DataModule {}
