import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  IJustificativasRepositorio,
  FiltroJustificativas,
} from '../interfaces/justificativas.repositorio.interface';
import { Justificativa } from '../../common/entities/justificativa.entity';
import { JustificativaOcorrencia } from '../../common/entities/justificativa-ocorrencia.entity';
import { StatusJustificativa } from '../../common/enums/status-justificativa.enum';
import { JUSTIFICATIVAS_SEED, USUARIOS_SEED } from './mock.seed';
import { Periodo } from '../../common/enums/periodo.enum';

@Injectable()
export class JustificativasMockRepositorio implements IJustificativasRepositorio {
  private readonly justificativas: Justificativa[] = [...JUSTIFICATIVAS_SEED];
  private readonly ocorrencias: JustificativaOcorrencia[] = [];

  private readonly colaboradorParaGerente: Record<string, string> = USUARIOS_SEED.reduce(
    (acc, u) => {
      if (u.gerenteId) acc[u.id] = u.gerenteId;
      return acc;
    },
    {} as Record<string, string>,
  );

  async findById(id: string): Promise<Justificativa | null> {
    return this.justificativas.find((j) => j.id === id) ?? null;
  }

  async findByColaboradorId(colaboradorId: string): Promise<Justificativa[]> {
    return this.justificativas.filter((j) => j.colaboradorId === colaboradorId);
  }

  async findPendentesByGerenteId(gerenteId: string): Promise<Justificativa[]> {
    const colaboradoresDoGerente = Object.entries(this.colaboradorParaGerente)
      .filter(([, gId]) => gId === gerenteId)
      .map(([cId]) => cId);

    return this.justificativas.filter(
      (j) =>
        colaboradoresDoGerente.includes(j.colaboradorId) &&
        j.status === StatusJustificativa.PENDENTE,
    );
  }

  async findAll(filtro?: FiltroJustificativas): Promise<Justificativa[]> {
    let resultado = [...this.justificativas];
    if (filtro?.colaboradorId) resultado = resultado.filter((j) => j.colaboradorId === filtro.colaboradorId);
    if (filtro?.status) resultado = resultado.filter((j) => j.status === filtro.status);
    if (filtro?.dataInicio) resultado = resultado.filter((j) => j.dataOcorrencia >= filtro.dataInicio!);
    if (filtro?.dataFim) resultado = resultado.filter((j) => j.dataOcorrencia <= filtro.dataFim!);
    return resultado;
  }

  async create(dados: Omit<Justificativa, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<Justificativa> {
    const nova: Justificativa = { ...dados, id: uuidv4(), criadoEm: new Date(), atualizadoEm: new Date() };
    this.justificativas.push(nova);
    return nova;
  }

  async update(id: string, dados: Partial<Justificativa>): Promise<Justificativa | null> {
    const idx = this.justificativas.findIndex((j) => j.id === id);
    if (idx === -1) return null;
    this.justificativas[idx] = { ...this.justificativas[idx], ...dados, atualizadoEm: new Date() };
    return this.justificativas[idx];
  }

  async marcarAjusteLancado(id: string, lancado: boolean): Promise<Justificativa | null> {
    return this.update(id, { atualizadoEm: new Date() });
  }

  async createOcorrencias(
    justificativaId: string,
    ocorrencias: Array<{ tipo: string; horarioCorreto?: string }>,
  ): Promise<JustificativaOcorrencia[]> {
    const novas = ocorrencias.map(o => ({
      id: uuidv4(),
      justificativaId,
      tipoOcorrencia: o.tipo as JustificativaOcorrencia['tipoOcorrencia'],
      horarioCorreto: o.horarioCorreto,
      criadoEm: new Date(),
    }));
    this.ocorrencias.push(...novas);
    return novas;
  }

  async findOcorrenciasByJustificativaId(justificativaId: string): Promise<JustificativaOcorrencia[]> {
    return this.ocorrencias.filter(o => o.justificativaId === justificativaId);
  }
}
