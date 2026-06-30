import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailService } from '../interfaces/email.service.interface';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailSmtpService implements IEmailService {
  private readonly logger = new Logger(EmailSmtpService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const port = Number(this.config.get<string>('SMTP_PORT', '587'));
    const secure = this.config.get<string>('SMTP_SECURE', 'false') === 'true';

    this.logger.log(`Configurando SMTP: host=${this.config.get('SMTP_HOST')}, port=${port}, secure=${secure}`);

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port,
      secure,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      ...((!secure && port === 587) ? { requireTLS: true } : {}),
    });
  }

  async enviar(opcoes: {
    para: string;
    assunto: string;
    corpo: string;
  }): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      const remetente = this.config.get<string>('SMTP_USER');
      await this.transporter.sendMail({
        from: `"JustPonto" <${remetente}>`,
        to: opcoes.para,
        subject: opcoes.assunto,
        text: opcoes.corpo,
      });
      this.logger.log(`Email enviado com sucesso para ${opcoes.para}`);
      return { sucesso: true };
    } catch (error: any) {
      this.logger.error(`Falha ao enviar email para ${opcoes.para}: ${error.message}`);
      return { sucesso: false, erro: error.message };
    }
  }
}
