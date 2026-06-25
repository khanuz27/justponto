import { IEmailService } from '../interfaces/email.service.interface';
export declare class EmailFakeService implements IEmailService {
    private readonly logger;
    enviar(opcoes: {
        para: string;
        assunto: string;
        corpo: string;
    }): Promise<{
        sucesso: boolean;
        erro?: string;
    }>;
}
