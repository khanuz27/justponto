import { StatusJustificativa } from '../enums/status-justificativa.enum';
import { Periodo } from '../enums/periodo.enum';
export declare class Justificativa {
    id: string;
    colaboradorId: string;
    tipoOcorrenciaId: string;
    dataOcorrencia: string;
    periodo: Periodo;
    horaInicio?: string;
    horaFim?: string;
    descricao: string;
    status: StatusJustificativa;
    aprovadorId?: string;
    comentarioAvaliacao?: string;
    avaliadoEm?: Date;
    criadoEm: Date;
    atualizadoEm: Date;
}
