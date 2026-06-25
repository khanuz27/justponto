import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AnexosService } from './anexos.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PerfilUsuario } from '../common/enums/perfil-usuario.enum';

@ApiTags('anexos')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('anexos')
export class AnexosController {
  constructor(private readonly service: AnexosService) {}

  @Post(':justificativaId')
  @Roles(PerfilUsuario.COLABORADOR)
  @UseInterceptors(FileInterceptor('arquivo', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { arquivo: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: 'Faz upload de comprovante (colaborador)' })
  upload(
    @Param('justificativaId', ParseUUIDPipe) justificativaId: string,
    @UploadedFile() arquivo: Express.Multer.File,
  ) {
    if (!arquivo) throw new BadRequestException('Arquivo é obrigatório');
    return this.service.upload(justificativaId, arquivo);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Obtém URL assinada para download do anexo' })
  download(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.obterUrlDownload(id);
  }

  @Get('justificativa/:justificativaId')
  @ApiOperation({ summary: 'Lista anexos de uma justificativa' })
  listarPorJustificativa(@Param('justificativaId', ParseUUIDPipe) justificativaId: string) {
    return this.service.listarPorJustificativa(justificativaId);
  }
}
