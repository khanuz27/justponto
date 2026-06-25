import { Periodo } from '../../common/enums/periodo.enum';
export declare class CriarJustificativaDto {
    tipoOcorrenciaId: string;
    dataOcorrencia: string;
    periodo?: Periodo;
    horaInicio?: string;
    horaFim?: string;
    descricao: string;
}
