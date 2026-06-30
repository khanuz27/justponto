import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailService } from '../interfaces/email.service.interface';
import { Resend } from 'resend';

@Injectable()
export class EmailSmtpService implements IEmailService {
  private readonly logger = new Logger(EmailSmtpService.name);
  private resend: Resend;
  private remetente: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY', '');
    this.remetente = this.config.get<string>('EMAIL_FROM', 'JustPonto <onboarding@resend.dev>');
    this.resend = new Resend(apiKey);
    this.logger.log(`Email configurado via Resend API (remetente: ${this.remetente})`);
  }

  async enviar(opcoes: {
    para: string;
    assunto: string;
    corpo: string;
  }): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.remetente,
        to: [opcoes.para],
        subject: opcoes.assunto,
        text: opcoes.corpo,
      });

      if (error) {
        this.logger.error(`Falha ao enviar email para ${opcoes.para}: ${error.message}`);
        return { sucesso: false, erro: error.message };
      }

      this.logger.log(`Email enviado com sucesso para ${opcoes.para} (id: ${data?.id})`);
      return { sucesso: true };
    } catch (error: any) {
      this.logger.error(`Erro ao enviar email para ${opcoes.para}: ${error.message}`);
      return { sucesso: false, erro: error.message };
    }
  }
}
