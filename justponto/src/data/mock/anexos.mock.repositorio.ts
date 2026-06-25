import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IAnexosRepositorio } from '../interfaces/anexos.repositorio.interface';
import { Anexo } from '../../common/entities/anexo.entity';

@Injectable()
export class AnexosMockRepositorio implements IAnexosRepositorio {
  private readonly anexos: Anexo[] = [];

  async findById(id: string): Promise<Anexo | null> {
    return this.anexos.find((a) => a.id === id) ?? null;
  }

  async findByJustificativaId(justificativaId: string): Promise<Anexo[]> {
    return this.anexos.filter((a) => a.justificativaId === justificativaId);
  }

  async create(dados: Omit<Anexo, 'id' | 'criadoEm'>): Promise<Anexo> {
    const novo: Anexo = { ...dados, id: uuidv4(), criadoEm: new Date() };
    this.anexos.push(novo);
    return novo;
  }

  async remove(id: string): Promise<boolean> {
    const idx = this.anexos.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.anexos.splice(idx, 1);
    return true;
  }
}
