import { TiposOcorrenciaService } from './tipos-ocorrencia.service';
import { CriarTipoOcorrenciaDto, AtualizarTipoOcorrenciaDto } from './dto/tipo-ocorrencia.dto';
export declare class TiposOcorrenciaController {
    private readonly service;
    constructor(service: TiposOcorrenciaService);
    listar(): Promise<import("../common/entities").TipoOcorrencia[]>;
    criar(dto: CriarTipoOcorrenciaDto): Promise<import("../common/entities").TipoOcorrencia>;
    atualizar(id: string, dto: AtualizarTipoOcorrenciaDto): Promise<import("../common/entities").TipoOcorrencia>;
    remover(id: string): Promise<{
        mensagem: string;
    }>;
}
