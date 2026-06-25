import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { INotificacoesRepositorio } from '../interfaces/notificacoes.repositorio.interface';
import { Notificacao } from '../../common/entities/notificacao.entity';

@Injectable()
export class NotificacoesMockRepositorio implements INotificacoesRepositorio {
  private readonly notificacoes: Notificacao[] = [];

  async findByJustificativaId(justificativaId: string): Promise<Notificacao[]> {
    return this.notificacoes.filter((n) => n.justificativaId === justificativaId);
  }

  async create(dados: Omit<Notificacao, 'id' | 'criadoEm'>): Promise<Notificacao> {
    const nova: Notificacao = { ...dados, id: uuidv4(), criadoEm: new Date() };
    this.notificacoes.push(nova);
    return nova;
  }

  async update(id: string, dados: Partial<Notificacao>): Promise<Notificacao | null> {
    const idx = this.notificacoes.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    this.notificacoes[idx] = { ...this.notificacoes[idx], ...dados };
    return this.notificacoes[idx];
  }
}
