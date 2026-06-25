import { Injectable, Logger } from '@nestjs/common';
import { IStorageService } from '../interfaces/storage.service.interface';

@Injectable()
export class StorageMockService implements IStorageService {
  private readonly logger = new Logger(StorageMockService.name);

  // Armazena os arquivos em memória durante o ciclo de vida do servidor
  private readonly arquivos = new Map<string, { buffer: Buffer; mime: string }>();

  async upload(
    justificativaId: string,
    nomeArquivo: string,
    buffer: Buffer,
    tipoMime: string,
  ): Promise<{ caminhoStorage: string }> {
    const caminhoStorage = `mock/${justificativaId}/${Date.now()}-${nomeArquivo}`;
    this.arquivos.set(caminhoStorage, { buffer, mime: tipoMime });
    this.logger.log(
      `[MOCK-STORAGE] Upload salvo em memória: ${caminhoStorage} (${buffer.length} bytes, ${tipoMime})`,
    );
    return { caminhoStorage };
  }

  async gerarUrlAssinada(caminhoStorage: string, expiracaoSegundos = 3600): Promise<string> {
    const url = `http://localhost:3000/mock-storage/${caminhoStorage}?expires=${Date.now() + expiracaoSegundos * 1000}`;
    this.logger.log(`[MOCK-STORAGE] URL assinada simulada: ${url}`);
    return url;
  }

  async remover(caminhoStorage: string): Promise<void> {
    this.arquivos.delete(caminhoStorage);
    this.logger.log(`[MOCK-STORAGE] Removido da memória: ${caminhoStorage}`);
  }

  /** Retorna o arquivo armazenado (usado pelo controller de download) */
  obterArquivo(caminhoStorage: string): { buffer: Buffer; mime: string } | undefined {
    return this.arquivos.get(caminhoStorage);
  }
}
