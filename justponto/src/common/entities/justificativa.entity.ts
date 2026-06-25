import { StatusJustificativa } from '../enums/status-justificativa.enum';
import { Periodo } from '../enums/periodo.enum';

export class Justificativa {
  id: string;
  colaboradorId: string;
  tipoOcorrenciaId: string;
  dataOcorrencia: string; // ISO date string YYYY-MM-DD
  periodo: Periodo;
  horaInicio?: string; // HH:mm
  horaFim?: string;    // HH:mm
  descricao: string;
  status: StatusJustificativa;
  aprovadorId?: string;
  comentarioAvaliacao?: string;
  avaliadoEm?: Date;
  criadoEm: Date;
  atualizadoEm: Date;
}
