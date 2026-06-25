import { JustificativasService } from './justificativas.service';
import { AnexosService } from '../anexos/anexos.service';
import { CriarJustificativaDto } from './dto/criar-justificativa.dto';
import { AvaliarJustificativaDto } from './dto/avaliar-justificativa.dto';
import { StatusJustificativa } from '../common/enums/status-justificativa.enum';
export declare class JustificativasController {
    private readonly service;
    private readonly anexosService;
    constructor(service: JustificativasService, anexosService: AnexosService);
    criar(dto: CriarJustificativaDto, usuario: any, arquivo?: Express.Multer.File): Promise<import("../common/entities").Justificativa>;
    listarMinhas(usuario: any): Promise<import("../common/entities").Justificativa[]>;
    listarPendentes(usuario: any): Promise<import("../common/entities").Justificativa[]>;
    listarTodas(colaboradorId?: string, status?: StatusJustificativa, dataInicio?: string, dataFim?: string): Promise<import("../common/entities").Justificativa[]>;
    avaliar(id: string, dto: AvaliarJustificativaDto, usuario: any): Promise<import("../common/entities").Justificativa>;
    marcarAjusteLancado(id: string): Promise<import("../common/entities").Justificativa>;
}
