export interface IStorageService {
    upload(justificativaId: string, nomeArquivo: string, buffer: Buffer, tipoMime: string): Promise<{
        caminhoStorage: string;
    }>;
    gerarUrlAssinada(caminhoStorage: string, expiracaoSegundos?: number): Promise<string>;
    remover(caminhoStorage: string): Promise<void>;
}
