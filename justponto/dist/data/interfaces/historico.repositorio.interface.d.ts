import { JustificativaHistorico } from '../../common/entities/justificativa-historico.entity';
export interface IHistoricoRepositorio {
    findByJustificativaId(justificativaId: string): Promise<JustificativaHistorico[]>;
    create(dados: Omit<JustificativaHistorico, 'id' | 'criadoEm'>): Promise<JustificativaHistorico>;
}
