export declare class Notificacao {
    id: string;
    justificativaId?: string;
    destinatarioId?: string;
    canal: string;
    assunto?: string;
    enviadoEm?: Date;
    statusEnvio: 'pendente' | 'enviado' | 'falha';
    erro?: string;
    criadoEm: Date;
}
