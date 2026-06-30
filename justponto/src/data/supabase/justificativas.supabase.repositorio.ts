import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  IJustificativasRepositorio,
  FiltroJustificativas,
} from '../interfaces/justificativas.repositorio.interface';
import { Justificativa } from '../../common/entities/justificativa.entity';
import { JustificativaOcorrencia } from '../../common/entities/justificativa-ocorrencia.entity';
import { StatusJustificativa } from '../../common/enums/status-justificativa.enum';
import { Periodo } from '../../common/enums/periodo.enum';
import { createSupabaseClient } from './supabase.client';

@Injectable()
export class JustificativasSupabaseRepositorio implements IJustificativasRepositorio {
  private readonly db: SupabaseClient;

  constructor(config: ConfigService) {
    this.db = createSupabaseClient(config);
  }

  private mapRow(row: any): Justificativa {
    return {
      id: row.id,
      colaboradorId: row.colaborador_id,
      tipoOcorrenciaId: row.tipo_ocorrencia_id,
      dataOcorrencia: row.data_ocorrencia,
      periodo: row.periodo as Periodo,
      horaInicio: row.hora_inicio ?? undefined,
      horaFim: row.hora_fim ?? undefined,
      descricao: row.descricao,
      motivoOutros: row.motivo_outros ?? undefined,
      status: row.status as StatusJustificativa,
      aprovadorId: row.aprovador_id ?? undefined,
      comentarioAvaliacao: row.comentario_avaliacao ?? undefined,
      avaliadoEm: row.avaliado_em ? new Date(row.avaliado_em) : undefined,
      criadoEm: new Date(row.criado_em),
      atualizadoEm: new Date(row.atualizado_em),
    };
  }

  private mapOcorrenciaRow(row: any): JustificativaOcorrencia {
    return {
      id: row.id,
      justificativaId: row.justificativa_id,
      tipoOcorrencia: row.tipo_ocorrencia,
      horarioCorreto: row.horario_correto ?? undefined,
      criadoEm: new Date(row.criado_em),
    };
  }

  async findById(id: string): Promise<Justificativa | null> {
    const { data, error } = await this.db
      .from('justificativas').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return this.mapRow(data);
  }

  async findByColaboradorId(colaboradorId: string): Promise<Justificativa[]> {
    const { data } = await this.db
      .from('justificativas').select('*')
      .eq('colaborador_id', colaboradorId)
      .order('criado_em', { ascending: false });
    return (data ?? []).map(r => this.mapRow(r));
  }

  async findPendentesByGerenteId(gerenteId: string): Promise<Justificativa[]> {
    // Retorna TODAS as pendentes (sem filtro por gerente_id)
    const { data } = await this.db
      .from('justificativas').select('*')
      .eq('status', StatusJustificativa.PENDENTE)
      .order('criado_em', { ascending: false });
    return (data ?? []).map(r => this.mapRow(r));
  }

  async findAll(filtro: FiltroJustificativas): Promise<Justificativa[]> {
    let query = this.db.from('justificativas').select('*');
    if (filtro.colaboradorId) query = query.eq('colaborador_id', filtro.colaboradorId);
    if (filtro.status)        query = query.eq('status', filtro.status);
    if (filtro.dataInicio)    query = query.gte('data_ocorrencia', filtro.dataInicio);
    if (filtro.dataFim)       query = query.lte('data_ocorrencia', filtro.dataFim);
    const { data } = await query.order('criado_em', { ascending: false });
    return (data ?? []).map(r => this.mapRow(r));
  }

  async create(dados: Omit<Justificativa, 'id'>): Promise<Justificativa> {
    const { data, error } = await this.db
      .from('justificativas').insert({
        colaborador_id:       dados.colaboradorId,
        tipo_ocorrencia_id:   dados.tipoOcorrenciaId,
        data_ocorrencia:      dados.dataOcorrencia,
        periodo:              dados.periodo,
        hora_inicio:          dados.horaInicio ?? null,
        hora_fim:             dados.horaFim ?? null,
        descricao:            dados.descricao,
        motivo_outros:        dados.motivoOutros ?? null,
        status:               dados.status,
        aprovador_id:         dados.aprovadorId ?? null,
        comentario_avaliacao: dados.comentarioAvaliacao ?? null,
        avaliado_em:          dados.avaliadoEm ?? null,
      }).select().single();
    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async update(id: string, dados: Partial<Justificativa>): Promise<Justificativa | null> {
    const patch: Record<string, any> = {};
    if (dados.status !== undefined)               patch.status               = dados.status;
    if (dados.aprovadorId !== undefined)           patch.aprovador_id         = dados.aprovadorId;
    if (dados.comentarioAvaliacao !== undefined)   patch.comentario_avaliacao = dados.comentarioAvaliacao;
    if (dados.avaliadoEm !== undefined)            patch.avaliado_em          = dados.avaliadoEm;

    const { data, error } = await this.db
      .from('justificativas').update(patch).eq('id', id).select().maybeSingle();
    if (error || !data) return null;
    return this.mapRow(data);
  }

  async marcarAjusteLancado(id: string, lancado: boolean): Promise<Justificativa | null> {
    const { data, error } = await this.db
      .from('justificativas').update({ ajuste_lancado: lancado }).eq('id', id).select().maybeSingle();
    if (error || !data) return null;
    return this.mapRow(data);
  }

  // ── Ocorrências ────────────────────────────────────────────────
  async createOcorrencias(
    justificativaId: string,
    ocorrencias: Array<{ tipo: string; horarioCorreto?: string }>,
  ): Promise<JustificativaOcorrencia[]> {
    if (!ocorrencias || ocorrencias.length === 0) return [];

    const rows = ocorrencias.map(o => ({
      justificativa_id: justificativaId,
      tipo_ocorrencia: o.tipo,
      horario_correto: o.horarioCorreto ?? null,
    }));

    const { data, error } = await this.db
      .from('justificativa_ocorrencias').insert(rows).select();
    if (error) throw new Error(error.message);
    return (data ?? []).map(r => this.mapOcorrenciaRow(r));
  }

  async findOcorrenciasByJustificativaId(justificativaId: string): Promise<JustificativaOcorrencia[]> {
    const { data } = await this.db
      .from('justificativa_ocorrencias').select('*')
      .eq('justificativa_id', justificativaId)
      .order('criado_em', { ascending: true });
    return (data ?? []).map(r => this.mapOcorrenciaRow(r));
  }
}
