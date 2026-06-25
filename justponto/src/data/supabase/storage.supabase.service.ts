import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { IStorageService } from '../interfaces/storage.service.interface';
import { createSupabaseClient } from './supabase.client';

@Injectable()
export class StorageSupabaseService implements IStorageService {
  private readonly db: SupabaseClient;
  private readonly bucket: string;
  private readonly logger = new Logger(StorageSupabaseService.name);

  constructor(config: ConfigService) {
    this.db = createSupabaseClient(config);
    this.bucket = config.get<string>('SUPABASE_STORAGE_BUCKET', 'anexos');
  }

  async upload(
    justificativaId: string,
    nomeArquivo: string,
    buffer: Buffer,
    tipoMime: string,
  ): Promise<{ caminhoStorage: string }> {
    const caminho = `justificativas/${justificativaId}/${Date.now()}-${nomeArquivo}`;

    const { error } = await this.db.storage
      .from(this.bucket)
      .upload(caminho, buffer, {
        contentType: tipoMime,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Falha no upload: ${error.message}`);
      throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`);
    }

    this.logger.log(`Upload concluído: ${caminho}`);
    return { caminhoStorage: caminho };
  }

  async gerarUrlAssinada(caminhoStorage: string, expiracaoSegundos = 3600): Promise<string> {
    const { data, error } = await this.db.storage
      .from(this.bucket)
      .createSignedUrl(caminhoStorage, expiracaoSegundos);

    if (error || !data?.signedUrl) {
      this.logger.error(`Falha ao gerar URL assinada: ${error?.message}`);
      throw new Error('Erro ao gerar URL de download');
    }

    return data.signedUrl;
  }

  async remover(caminhoStorage: string): Promise<void> {
    const { error } = await this.db.storage
      .from(this.bucket)
      .remove([caminhoStorage]);

    if (error) {
      this.logger.warn(`Falha ao remover arquivo ${caminhoStorage}: ${error.message}`);
    }
  }
}
