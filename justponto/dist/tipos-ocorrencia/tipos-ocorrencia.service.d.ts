import { ITiposOcorrenciaRepositorio } from '../data/interfaces/tipos-ocorrencia.repositorio.interface';
import { CriarTipoOcorrenciaDto, AtualizarTipoOcorrenciaDto } from './dto/tipo-ocorrencia.dto';
import { TipoOcorrencia } from '../common/entities/tipo-ocorrencia.entity';
export declare class TiposOcorrenciaService {
    private readonly tiposRepo;
    constructor(tiposRepo: ITiposOcorrenciaRepositorio);
    listar(): Promise<TipoOcorrencia[]>;
    buscarPorId(id: string): Promise<TipoOcorrencia>;
    criar(dto: CriarTipoOcorrenciaDto): Promise<TipoOcorrencia>;
    atualizar(id: string, dto: AtualizarTipoOcorrenciaDto): Promise<TipoOcorrencia>;
    remover(id: string): Promise<{
        mensagem: string;
    }>;
}
