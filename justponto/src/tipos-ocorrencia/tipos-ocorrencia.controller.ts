import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TiposOcorrenciaService } from './tipos-ocorrencia.service';
import { CriarTipoOcorrenciaDto, AtualizarTipoOcorrenciaDto } from './dto/tipo-ocorrencia.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PerfilUsuario } from '../common/enums/perfil-usuario.enum';

@ApiTags('tipos-ocorrencia')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('tipos-ocorrencia')
export class TiposOcorrenciaController {
  constructor(private readonly service: TiposOcorrenciaService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os tipos de ocorrência ativos (qualquer autenticado)' })
  listar() {
    return this.service.listar();
  }

  @Post()
  @Roles(PerfilUsuario.RH, PerfilUsuario.DIRECAO)
  @ApiOperation({ summary: 'Cria novo tipo (RH/Direção)' })
  criar(@Body() dto: CriarTipoOcorrenciaDto) {
    return this.service.criar(dto);
  }

  @Patch(':id')
  @Roles(PerfilUsuario.RH, PerfilUsuario.DIRECAO)
  @ApiOperation({ summary: 'Atualiza tipo (RH/Direção)' })
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarTipoOcorrenciaDto,
  ) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  @Roles(PerfilUsuario.RH, PerfilUsuario.DIRECAO)
  @ApiOperation({ summary: 'Desativa tipo (RH/Direção)' })
  remover(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remover(id);
  }
}
