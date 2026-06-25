import { Notificacao } from '../../common/entities/notificacao.entity';
export interface INotificacoesRepositorio {
    findByJustificativaId(justificativaId: string): Promise<Notificacao[]>;
    create(dados: Omit<Notificacao, 'id' | 'criadoEm'>): Promise<Notificacao>;
    update(id: string, dados: Partial<Notificacao>): Promise<Notificacao | null>;
}
