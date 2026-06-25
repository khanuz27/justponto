import { IStorageService } from '../interfaces/storage.service.interface';
export declare class StorageMockService implements IStorageService {
    private readonly logger;
    upload(justificativaId: string, nomeArquivo: string, buffer: Buffer, tipoMime: string): Promise<{
        caminhoStorage: string;
    }>;
    gerarUrlAssinada(caminhoStorage: string, expiracaoSegundos?: number): Promise<string>;
    remover(caminhoStorage: string): Promise<void>;
}
