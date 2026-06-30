import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { IUsuariosRepositorio } from '../interfaces/usuarios.repositorio.interface';
import { Usuario } from '../../common/entities/usuario.entity';
import { PerfilUsuario } from '../../common/enums/perfil-usuario.enum';
import { createSupabaseClient } from './supabase.client';

@Injectable()
export class UsuariosSupabaseRepositorio implements IUsuariosRepositorio {
  private readonly db: SupabaseClient;

  constructor(config: ConfigService) {
    this.db = createSupabaseClient(config);
  }

  private mapRow(row: any): Usuario {
    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      senhaHash: row.senha_hash,
      perfil: row.perfil as PerfilUsuario,
      gerenteId: row.gerente_id ?? undefined,
      departamento: row.departamento ?? undefined,
      ativo: row.ativo,
      criadoEm: new Date(row.criado_em),
      atualizadoEm: new Date(row.atualizado_em),
    };
  }

  async findById(id: string): Promise<Usuario | null> {
    const { data, error } = await this.db
      .from('usuarios').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return this.mapRow(data);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await this.db
      .from('usuarios').select('*').eq('email', email).maybeSingle();
    if (error || !data) return null;
    return this.mapRow(data);
  }

  async findAll(): Promise<Usuario[]> {
    const { data } = await this.db
      .from('usuarios').select('*').order('nome');
    return (data ?? []).map(r => this.mapRow(r));
  }

  async findByGerenteId(gerenteId: string): Promise<Usuario[]> {
    const { data } = await this.db
      .from('usuarios').select('*')
      .eq('gerente_id', gerenteId).eq('ativo', true).order('nome');
    return (data ?? []).map(r => this.mapRow(r));
  }

  async create(dados: Omit<Usuario, 'id'>): Promise<Usuario> {
    const { data, error } = await this.db
      .from('usuarios').insert({
        nome: dados.nome,
        email: dados.email,
        senha_hash: dados.senhaHash,
        perfil: dados.perfil,
        gerente_id: dados.gerenteId ?? null,
        departamento: dados.departamento ?? null,
        ativo: dados.ativo,
      }).select().single();
    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async atualizarAtivo(id: string, ativo: boolean): Promise<Usuario | null> {
    const { data, error } = await this.db
      .from('usuarios').update({ ativo }).eq('id', id).select().maybeSingle();
    if (error || !data) return null;
    return this.mapRow(data);
  }

  async findByPerfil(perfil: PerfilUsuario): Promise<Usuario[]> {
    const { data } = await this.db
      .from('usuarios').select('*')
      .eq('perfil', perfil).eq('ativo', true).order('nome');
    return (data ?? []).map(r => this.mapRow(r));
  }
}
