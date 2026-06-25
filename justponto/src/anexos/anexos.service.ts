import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IAnexosRepositorio } from '../data/interfaces/anexos.repositorio.interface';
import { IStorageService } from '../data/interfaces/storage.service.interface';
import { IJustificativasRepositorio } from '../data/interfaces/justificativas.repositorio.interface';
import { ANEXOS_REPO, STORAGE_SERVICE, JUSTIFICATIVAS_REPO } from '../data/data.module';
import { Anexo } from '../common/entities/anexo.entity';

const MIMES_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
const TAMANHO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class AnexosService {
  constructor(
    @Inject(ANEXOS_REPO)
    private readonly anexosRepo: IAnexosRepositorio,
    @Inject(STORAGE_SERVICE)
    private readonly storage: IStorageService,
    @Inject(JUSTIFICATIVAS_REPO)
    private readonly justificativasRepo: IJustificativasRepositorio,
  ) {}

  async upload(
    justificativaId: string,
    arquivo: Express.Multer.File,
  ): Promise<Anexo> {
    // Valida se justificativa existe
    const justificativa = await this.justificativasRepo.findById(justificativaId);
    if (!justificativa) {
      throw new NotFoundException(`Justificativa ${justificativaId} não encontrada`);
    }

    // Valida tipo MIME
    if (!MIMES_PERMITIDOS.includes(arquivo.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo não permitido. Use PDF, JPG ou PNG.`,
      );
    }

    // Valida tamanho
    if (arquivo.size > TAMANHO_MAX_BYTES) {
      throw new BadRequestException(
        `Arquivo muito grande. Máximo permitido: 5MB.`,
      );
    }

    // Sanitiza nome do arquivo
    const nomeSeguro = arquivo.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');

    const { caminhoStorage } = await this.storage.upload(
      justificativaId,
      nomeSeguro,
      arquivo.buffer,
      arquivo.mimetype,
    );

    return this.anexosRepo.create({
      justificativaId,
      nomeArquivo: nomeSeguro,
      caminhoStorage,
      tipoMime: arquivo.mimetype,
      tamanhoBytes: arquivo.size,
    });
  }

  async obterUrlDownload(id: string): Promise<{ url: string }> {
    const anexo = await this.anexosRepo.findById(id);
    if (!anexo) throw new NotFoundException(`Anexo ${id} não encontrado`);

    const url = await this.storage.gerarUrlAssinada(anexo.caminhoStorage, 3600);
    return { url };
  }

  async listarPorJustificativa(justificativaId: string): Promise<Anexo[]> {
    return this.anexosRepo.findByJustificativaId(justificativaId);
  }
}
