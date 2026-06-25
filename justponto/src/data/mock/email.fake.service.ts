import { Injectable, Logger } from '@nestjs/common';
import { IEmailService } from '../interfaces/email.service.interface';

@Injectable()
export class EmailFakeService implements IEmailService {
  private readonly logger = new Logger(EmailFakeService.name);

  async enviar(opcoes: {
    para: string;
    assunto: string;
    corpo: string;
  }): Promise<{ sucesso: boolean; erro?: string }> {
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.log(`[MOCK-EMAIL] Para:    ${opcoes.para}`);
    this.logger.log(`[MOCK-EMAIL] Assunto: ${opcoes.assunto}`);
    this.logger.log(`[MOCK-EMAIL] Corpo:\n${opcoes.corpo}`);
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { sucesso: true };
  }
}
