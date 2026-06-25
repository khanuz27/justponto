import { IAnexosRepositorio } from '../data/interfaces/anexos.repositorio.interface';
import { IStorageService } from '../data/interfaces/storage.service.interface';
import { IJustificativasRepositorio } from '../data/interfaces/justificativas.repositorio.interface';
import { Anexo } from '../common/entities/anexo.entity';
export declare class AnexosService {
    private readonly anexosRepo;
    private readonly storage;
    private readonly justificativasRepo;
    constructor(anexosRepo: IAnexosRepositorio, storage: IStorageService, justificativasRepo: IJustificativasRepositorio);
    upload(justificativaId: string, arquivo: Express.Multer.File): Promise<Anexo>;
    obterUrlDownload(id: string): Promise<{
        url: string;
    }>;
    listarPorJustificativa(justificativaId: string): Promise<Anexo[]>;
}
