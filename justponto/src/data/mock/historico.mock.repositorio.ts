import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IHistoricoRepositorio } from '../interfaces/historico.repositorio.interface';
import { JustificativaHistorico } from '../../common/entities/justificativa-historico.entity';
import { JUSTIFICATIVAS_SEED, SEED_IDS } from './mock.seed';
import { StatusJustificativa } from '../../common/enums/status-justificativa.enum';

@Injectable()
export class HistoricoMockRepositorio implements IHistoricoRepositorio {
  private readonly historico: JustificativaHistorico[] = [
    // Registro inicial da just2 (aprovada no seed)
    {
      id: uuidv4(),
      justificativaId: SEED_IDS.just2,
      statusAnterior: StatusJustificativa.PENDENTE,
      statusNovo: StatusJustificativa.APROVADA,
      alteradoPorId: SEED_IDS.gerente,
      comentario: 'Confirmado pelo noticiário.',
      criadoEm: new Date('2024-06-06T14:00:00Z'),
    },
  ];

  async findByJustificativaId(justificativaId: string): Promise<JustificativaHistorico[]> {
    return this.historico.filter((h) => h.justificativaId === justificativaId);
  }

  async create(
    dados: Omit<JustificativaHistorico, 'id' | 'criadoEm'>,
  ): Promise<JustificativaHistorico> {
    const novo: JustificativaHistorico = { ...dados, id: uuidv4(), criadoEm: new Date() };
    this.historico.push(novo);
    return novo;
  }
}
