import { StatusJustificativa } from '../../common/enums/status-justificativa.enum';
export declare class AvaliarJustificativaDto {
    status: StatusJustificativa.APROVADA | StatusJustificativa.REPROVADA;
    comentario?: string;
}
