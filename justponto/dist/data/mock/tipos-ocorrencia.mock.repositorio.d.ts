import { ITiposOcorrenciaRepositorio } from '../interfaces/tipos-ocorrencia.repositorio.interface';
import { TipoOcorrencia } from '../../common/entities/tipo-ocorrencia.entity';
import { CriarTipoOcorrenciaDto, AtualizarTipoOcorrenciaDto } from '../../tipos-ocorrencia/dto/tipo-ocorrencia.dto';
export declare class TiposOcorrenciaMockRepositorio implements ITiposOcorrenciaRepositorio {
    private readonly tipos;
    findAll(apenasAtivos?: boolean): Promise<TipoOcorrencia[]>;
    findById(id: string): Promise<TipoOcorrencia | null>;
    create(dto: CriarTipoOcorrenciaDto): Promise<TipoOcorrencia>;
    update(id: string, dto: AtualizarTipoOcorrenciaDto): Promise<TipoOcorrencia | null>;
    remove(id: string): Promise<boolean>;
}
