import { INotificacoesRepositorio } from '../interfaces/notificacoes.repositorio.interface';
import { Notificacao } from '../../common/entities/notificacao.entity';
export declare class NotificacoesMockRepositorio implements INotificacoesRepositorio {
    private readonly notificacoes;
    findByJustificativaId(justificativaId: string): Promise<Notificacao[]>;
    create(dados: Omit<Notificacao, 'id' | 'criadoEm'>): Promise<Notificacao>;
    update(id: string, dados: Partial<Notificacao>): Promise<Notificacao | null>;
}
