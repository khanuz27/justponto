import { IHistoricoRepositorio } from '../interfaces/historico.repositorio.interface';
import { JustificativaHistorico } from '../../common/entities/justificativa-historico.entity';
export declare class HistoricoMockRepositorio implements IHistoricoRepositorio {
    private readonly historico;
    findByJustificativaId(justificativaId: string): Promise<JustificativaHistorico[]>;
    create(dados: Omit<JustificativaHistorico, 'id' | 'criadoEm'>): Promise<JustificativaHistorico>;
}
