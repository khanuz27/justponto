import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { INotificacoesRepositorio } from '../interfaces/notificacoes.repositorio.interface';
import { Notificacao } from '../../common/entities/notificacao.entity';
import { createSupabaseClient } from './supabase.client';

@Injectable()
export class NotificacoesSupabaseRepositorio implements INotificacoesRepositorio {
  private readonly db: SupabaseClient;

  constructor(config: ConfigService) {
    this.db = createSupabaseClient(config);
  }

  private mapRow(row: any): Notificacao {
    return {
      id: row.id,
      justificativaId: row.justificativa_id ?? undefined,
      destinatarioId: row.destinatario_id ?? undefined,
      canal: row.canal,
      assunto: row.assunto ?? undefined,
      enviadoEm: row.enviado_em ? new Date(row.enviado_em) : undefined,
      statusEnvio: row.status_envio as 'pendente' | 'enviado' | 'falha',
      erro: row.erro ?? undefined,
      criadoEm: new Date(row.criado_em),
    };
  }

  async findByJustificativaId(justificativaId: string): Promise<Notificacao[]> {
    const { data } = await this.db
      .from('notificacoes').select('*')
      .eq('justificativa_id', justificativaId)
      .order('criado_em');
    return (data ?? []).map(r => this.mapRow(r));
  }

  async create(dados: Omit<Notificacao, 'id' | 'criadoEm'>): Promise<Notificacao> {
    const { data, error } = await this.db
      .from('notificacoes').insert({
        justificativa_id: dados.justificativaId ?? null,
        destinatario_id:  dados.destinatarioId ?? null,
        canal:            dados.canal,
        assunto:          dados.assunto ?? null,
        enviado_em:       dados.enviadoEm ?? null,
        status_envio:     dados.statusEnvio,
        erro:             dados.erro ?? null,
      }).select().single();
    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async update(id: string, dados: Partial<Notificacao>): Promise<Notificacao | null> {
    const patch: Record<string, any> = {};
    if (dados.statusEnvio !== undefined) patch.status_envio = dados.statusEnvio;
    if (dados.enviadoEm   !== undefined) patch.enviado_em   = dados.enviadoEm;
    if (dados.erro        !== undefined) patch.erro         = dados.erro;

    const { data, error } = await this.db
      .from('notificacoes').update(patch).eq('id', id).select().maybeSingle();
    if (error || !data) return null;
    return this.mapRow(data);
  }
}
