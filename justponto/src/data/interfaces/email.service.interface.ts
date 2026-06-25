export interface IEmailService {
  enviar(opcoes: {
    para: string;
    assunto: string;
    corpo: string;
  }): Promise<{ sucesso: boolean; erro?: string }>;
}
