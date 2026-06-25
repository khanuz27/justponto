import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IUsuariosRepositorio } from '../interfaces/usuarios.repositorio.interface';
import { Usuario } from '../../common/entities/usuario.entity';
import { USUARIOS_SEED } from './mock.seed';

@Injectable()
export class UsuariosMockRepositorio implements IUsuariosRepositorio {
  private readonly usuarios: Usuario[] = [...USUARIOS_SEED];

  async findById(id: string): Promise<Usuario | null> {
    return this.usuarios.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarios.find((u) => u.email === email) ?? null;
  }

  async findAll(): Promise<Usuario[]> {
    return [...this.usuarios]; // retorna todos, incluindo inativos
  }

  async findByGerenteId(gerenteId: string): Promise<Usuario[]> {
    return this.usuarios.filter((u) => u.gerenteId === gerenteId && u.ativo);
  }

  async create(dados: Omit<Usuario, 'id'>): Promise<Usuario> {
    const novo: Usuario = { ...dados, id: uuidv4() };
    this.usuarios.push(novo);
    return novo;
  }

  async atualizarAtivo(id: string, ativo: boolean): Promise<Usuario | null> {
    const usuario = this.usuarios.find((u) => u.id === id);
    if (!usuario) return null;
    usuario.ativo = ativo;
    usuario.atualizadoEm = new Date();
    return usuario;
  }
}
