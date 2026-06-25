import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { ITiposOcorrenciaRepositorio } from '../interfaces/tipos-ocorrencia.repositorio.interface';
import { TipoOcorrencia } from '../../common/entities/tipo-ocorrencia.entity';
import { createSupabaseClient } from './supabase.client';

// DTOs locais — mesma estrutura dos DTOs do módulo tipos-ocorrencia
interface CriarTipoDto { nome: string; descricao?: string; exigeAnexo?: boolean; }
interface AtualizarTipoDto { nome?: string; descricao?: string; exigeAnexo?: boolean; ativo?: boolean; }

@Injectable()
export class TiposOcorrenciaSupabaseRepositorio implements ITiposOcorrenciaRepositorio {
  private readonly db: SupabaseClient;

  constructor(config: ConfigService) {
    this.db = createSupabaseClient(config);
  }

  private mapRow(row: any): TipoOcorrencia {
    return {
      id: row.id,
      nome: row.nome,
      descricao: row.descricao ?? undefined,
      exigeAnexo: row.exige_anexo,
      ativo: row.ativo,
      criadoEm: new Date(row.criado_em),
    };
  }

  async findAll(apenasAtivos = false): Promise<TipoOcorrencia[]> {
    let query = this.db.from('tipos_ocorrencia').select('*');
    if (apenasAtivos) query = query.eq('ativo', true);
    const { data } = await query.order('nome');
    return (data ?? []).map(r => this.mapRow(r));
  }

  async findById(id: string): Promise<TipoOcorrencia | null> {
    const { data, error } = await this.db
      .from('tipos_ocorrencia').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return this.mapRow(data);
  }

  async create(dto: CriarTipoDto): Promise<TipoOcorrencia> {
    const { data, error } = await this.db
      .from('tipos_ocorrencia').insert({
        nome:        dto.nome,
        descricao:   dto.descricao ?? null,
        exige_anexo: dto.exigeAnexo ?? false,
        ativo:       true,
      }).select().single();
    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async update(id: string, dto: AtualizarTipoDto): Promise<TipoOcorrencia | null> {
    const patch: Record<string, any> = {};
    if (dto.nome        !== undefined) patch.nome        = dto.nome;
    if (dto.descricao   !== undefined) patch.descricao   = dto.descricao;
    if (dto.exigeAnexo  !== undefined) patch.exige_anexo = dto.exigeAnexo;
    if (dto.ativo       !== undefined) patch.ativo       = dto.ativo;

    const { data, error } = await this.db
      .from('tipos_ocorrencia').update(patch).eq('id', id).select().maybeSingle();
    if (error || !data) return null;
    return this.mapRow(data);
  }

  async remove(id: string): Promise<boolean> {
    const { error } = await this.db.from('tipos_ocorrencia').delete().eq('id', id);
    return !error;
  }
}
