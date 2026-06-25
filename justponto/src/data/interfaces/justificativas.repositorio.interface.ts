import { Justificativa } from '../../common/entities/justificativa.entity';
import { StatusJustificativa } from '../../common/enums/status-justificativa.enum';

export interface FiltroJustificativas {
  colaboradorId?: string;
  status?: StatusJustificativa;
  dataInicio?: string;
  dataFim?: string;
  ajusteLancado?: boolean;
}

export interface IJustificativasRepositorio {
  findById(id: string): Promise<Justificativa | null>;
  findByColaboradorId(colaboradorId: string): Promise<Justificativa[]>;
  findPendentesByGerenteId(gerenteId: string): Promise<Justificativa[]>;
  findAll(filtro?: FiltroJustificativas): Promise<Justificativa[]>;
  create(dados: Omit<Justificativa, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<Justificativa>;
  update(id: string, dados: Partial<Justificativa>): Promise<Justificativa | null>;
  marcarAjusteLancado(id: string, lancado: boolean): Promise<Justificativa | null>;
}
