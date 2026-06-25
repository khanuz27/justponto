import { Injectable, Logger } from '@nestjs/common';
import { IStorageService } from '../interfaces/storage.service.interface';

@Injectable()
export class StorageMockService implements IStorageService {
  private readonly logger = new Logger(StorageMockService.name);

  async upload(
    justificativaId: string,
    nomeArquivo: string,
    buffer: Buffer,
    tipoMime: string,
  ): Promise<{ caminhoStorage: string }> {
    const caminhoStorage = `mock/${justificativaId}/${Date.now()}-${nomeArquivo}`;
    this.logger.log(
      `[MOCK-STORAGE] Upload simulado: ${caminhoStorage} (${buffer.length} bytes, ${tipoMime})`,
    );
    return { caminhoStorage };
  }

  async gerarUrlAssinada(caminhoStorage: string, expiracaoSegundos = 3600): Promise<string> {
    const url = `http://localhost:3000/mock-storage/${caminhoStorage}?expires=${Date.now() + expiracaoSegundos * 1000}`;
    this.logger.log(`[MOCK-STORAGE] URL assinada simulada: ${url}`);
    return url;
  }

  async remover(caminhoStorage: string): Promise<void> {
    this.logger.log(`[MOCK-STORAGE] Remoção simulada: ${caminhoStorage}`);
  }
}
