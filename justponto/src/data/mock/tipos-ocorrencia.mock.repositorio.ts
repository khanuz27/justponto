import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ITiposOcorrenciaRepositorio } from '../interfaces/tipos-ocorrencia.repositorio.interface';
import { TipoOcorrencia } from '../../common/entities/tipo-ocorrencia.entity';
import { CriarTipoOcorrenciaDto, AtualizarTipoOcorrenciaDto } from '../../tipos-ocorrencia/dto/tipo-ocorrencia.dto';
import { TIPOS_SEED } from './mock.seed';

@Injectable()
export class TiposOcorrenciaMockRepositorio implements ITiposOcorrenciaRepositorio {
  private readonly tipos: TipoOcorrencia[] = [...TIPOS_SEED];

  async findAll(apenasAtivos = true): Promise<TipoOcorrencia[]> {
    return apenasAtivos ? this.tipos.filter((t) => t.ativo) : this.tipos;
  }

  async findById(id: string): Promise<TipoOcorrencia | null> {
    return this.tipos.find((t) => t.id === id) ?? null;
  }

  async create(dto: CriarTipoOcorrenciaDto): Promise<TipoOcorrencia> {
    const novo: TipoOcorrencia = {
      id: uuidv4(),
      nome: dto.nome,
      descricao: dto.descricao,
      exigeAnexo: dto.exigeAnexo,
      ativo: true,
      criadoEm: new Date(),
    };
    this.tipos.push(novo);
    return novo;
  }

  async update(id: string, dto: AtualizarTipoOcorrenciaDto): Promise<TipoOcorrencia | null> {
    const idx = this.tipos.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.tipos[idx] = { ...this.tipos[idx], ...dto };
    return this.tipos[idx];
  }

  async remove(id: string): Promise<boolean> {
    const idx = this.tipos.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.tipos[idx].ativo = false;
    return true;
  }
}
