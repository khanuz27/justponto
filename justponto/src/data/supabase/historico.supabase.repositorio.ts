import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { IHistoricoRepositorio } from '../interfaces/historico.repositorio.interface';
import { JustificativaHistorico } from '../../common/entities/justificativa-historico.entity';
import { StatusJustificativa } from '../../common/enums/status-justificativa.enum';
import { createSupabaseClient } from './supabase.client';

@Injectable()
export class HistoricoSupabaseRepositorio implements IHistoricoRepositorio {
  private readonly db: SupabaseClient;

  constructor(config: ConfigService) {
    this.db = createSupabaseClient(config);
  }

  private mapRow(row: any): JustificativaHistorico {
    return {
      id: row.id,
      justificativaId: row.justificativa_id,
      statusAnterior: row.status_anterior as StatusJustificativa ?? undefined,
      statusNovo: row.status_novo as StatusJustificativa,
      alteradoPorId: row.alterado_por_id ?? undefined,
      comentario: row.comentario ?? undefined,
      criadoEm: new Date(row.criado_em),
    };
  }

  async findByJustificativaId(justificativaId: string): Promise<JustificativaHistorico[]> {
    const { data } = await this.db
      .from('justificativas_historico').select('*')
      .eq('justificativa_id', justificativaId)
      .order('criado_em');
    return (data ?? []).map(r => this.mapRow(r));
  }

  async create(dados: Omit<JustificativaHistorico, 'id' | 'criadoEm'>): Promise<JustificativaHistorico> {
    const { data, error } = await this.db
      .from('justificativas_historico').insert({
        justificativa_id: dados.justificativaId,
        status_anterior:  dados.statusAnterior ?? null,
        status_novo:      dados.statusNovo,
        alterado_por_id:  dados.alteradoPorId ?? null,
        comentario:       dados.comentario ?? null,
      }).select().single();
    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }
}
