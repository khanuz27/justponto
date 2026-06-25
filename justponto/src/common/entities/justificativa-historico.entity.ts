import { StatusJustificativa } from '../enums/status-justificativa.enum';

export class JustificativaHistorico {
  id: string;
  justificativaId: string;
  statusAnterior?: StatusJustificativa;
  statusNovo: StatusJustificativa;
  alteradoPorId?: string;
  comentario?: string;
  criadoEm: Date;
}
