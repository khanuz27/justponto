import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { StorageMockService } from '../data/mock/storage.mock.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('mock-storage')
@Public()
@Controller('mock-storage')
export class MockStorageController {
  constructor(private readonly storage: StorageMockService) {}

  /**
   * Serve arquivos do mock de storage.
   * URL format: GET /mock-storage/mock/{justificativaId}/{timestamp}-{filename}
   */
  @Get('mock/:justificativaId/:filename')
  @ApiOperation({ summary: '[DEV] Serve arquivo do mock storage' })
  servirArquivo(
    @Param('justificativaId') justificativaId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const caminho = `mock/${justificativaId}/${filename}`;
    const arquivo = this.storage.obterArquivo(caminho);

    if (!arquivo) {
      throw new NotFoundException(
        `Arquivo não encontrado no mock storage: ${caminho}. ` +
        `Nota: arquivos são mantidos apenas em memória e são perdidos ao reiniciar o servidor.`,
      );
    }

    res.set({
      'Content-Type': arquivo.mime,
      'Content-Length': arquivo.buffer.length,
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'no-cache',
    });
    res.end(arquivo.buffer);
  }
}
