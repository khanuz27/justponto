import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { IAnexosRepositorio } from '../interfaces/anexos.repositorio.interface';
import { Anexo } from '../../common/entities/anexo.entity';
import { createSupabaseClient } from './supabase.client';

@Injectable()
export class AnexosSupabaseRepositorio implements IAnexosRepositorio {
  private readonly db: SupabaseClient;

  constructor(config: ConfigService) {
    this.db = createSupabaseClient(config);
  }

  private mapRow(row: any): Anexo {
    return {
      id: row.id,
      justificativaId: row.justificativa_id,
      nomeArquivo: row.nome_arquivo,
      caminhoStorage: row.caminho_storage,
      tipoMime: row.tipo_mime ?? undefined,
      tamanhoBytes: row.tamanho_bytes ?? undefined,
      criadoEm: new Date(row.criado_em),
    };
  }

  async findById(id: string): Promise<Anexo | null> {
    const { data, error } = await this.db
      .from('anexos').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return this.mapRow(data);
  }

  async findByJustificativaId(justificativaId: string): Promise<Anexo[]> {
    const { data } = await this.db
      .from('anexos').select('*')
      .eq('justificativa_id', justificativaId)
      .order('criado_em');
    return (data ?? []).map(r => this.mapRow(r));
  }

  async create(dados: Omit<Anexo, 'id' | 'criadoEm'>): Promise<Anexo> {
    const { data, error } = await this.db
      .from('anexos').insert({
        justificativa_id: dados.justificativaId,
        nome_arquivo:     dados.nomeArquivo,
        caminho_storage:  dados.caminhoStorage,
        tipo_mime:        dados.tipoMime ?? null,
        tamanho_bytes:    dados.tamanhoBytes ?? null,
      }).select().single();
    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async remove(id: string): Promise<boolean> {
    const { error } = await this.db.from('anexos').delete().eq('id', id);
    return !error;
  }
}
