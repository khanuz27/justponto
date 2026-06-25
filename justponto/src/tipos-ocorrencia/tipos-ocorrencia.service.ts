import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ITiposOcorrenciaRepositorio } from '../data/interfaces/tipos-ocorrencia.repositorio.interface';
import { TIPOS_OCORRENCIA_REPO } from '../data/data.module';
import { CriarTipoOcorrenciaDto, AtualizarTipoOcorrenciaDto } from './dto/tipo-ocorrencia.dto';
import { TipoOcorrencia } from '../common/entities/tipo-ocorrencia.entity';

@Injectable()
export class TiposOcorrenciaService {
  constructor(
    @Inject(TIPOS_OCORRENCIA_REPO)
    private readonly tiposRepo: ITiposOcorrenciaRepositorio,
  ) {}

  async listar(): Promise<TipoOcorrencia[]> {
    return this.tiposRepo.findAll(true);
  }

  async buscarPorId(id: string): Promise<TipoOcorrencia> {
    const tipo = await this.tiposRepo.findById(id);
    if (!tipo) throw new NotFoundException(`Tipo de ocorrência ${id} não encontrado`);
    return tipo;
  }

  async criar(dto: CriarTipoOcorrenciaDto): Promise<TipoOcorrencia> {
    return this.tiposRepo.create(dto);
  }

  async atualizar(id: string, dto: AtualizarTipoOcorrenciaDto): Promise<TipoOcorrencia> {
    const atualizado = await this.tiposRepo.update(id, dto);
    if (!atualizado) throw new NotFoundException(`Tipo de ocorrência ${id} não encontrado`);
    return atualizado;
  }

  async remover(id: string): Promise<{ mensagem: string }> {
    const removido = await this.tiposRepo.remove(id);
    if (!removido) throw new NotFoundException(`Tipo de ocorrência ${id} não encontrado`);
    return { mensagem: 'Tipo de ocorrência desativado com sucesso' };
  }
}
