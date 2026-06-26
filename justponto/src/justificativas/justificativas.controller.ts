import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JustificativasService } from './justificativas.service';
import { AnexosService } from '../anexos/anexos.service';
import { CriarJustificativaDto } from './dto/criar-justificativa.dto';
import { AvaliarJustificativaDto } from './dto/avaliar-justificativa.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsuarioAtual } from '../common/decorators/usuario-atual.decorator';
import { PerfilUsuario } from '../common/enums/perfil-usuario.enum';
import { StatusJustificativa } from '../common/enums/status-justificativa.enum';

@ApiTags('justificativas')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('justificativas')
export class JustificativasController {
  constructor(
    private readonly service: JustificativasService,
    private readonly anexosService: AnexosService,
  ) {}

  // ── Colaborador: criar ────────────────────────────────────────
  @Post()
  @Roles(PerfilUsuario.COLABORADOR)
  @UseInterceptors(FileInterceptor('anexo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cria nova justificativa (colaborador)' })
  async criar(
    @Body() rawDto: any,
    @UsuarioAtual() usuario: any,
    @UploadedFile() arquivo?: Express.Multer.File,
  ) {
    // Quando vem como FormData, o campo ocorrencias chega como string JSON
    const dto: CriarJustificativaDto = { ...rawDto };
    if (typeof dto.ocorrencias === 'string') {
      try { dto.ocorrencias = JSON.parse(dto.ocorrencias); } catch { dto.ocorrencias = []; }
    }

    const justificativa = await this.service.criar(dto, usuario.id, !!arquivo);

    if (arquivo) {
      await this.anexosService.upload(justificativa.id, arquivo);
    }

    return justificativa;
  }

  // ── Colaborador: ver as próprias ──────────────────────────────
  @Get('minhas')
  @Roles(PerfilUsuario.COLABORADOR)
  @ApiOperation({ summary: 'Lista as justificativas do colaborador logado' })
  listarMinhas(@UsuarioAtual() usuario: any) {
    return this.service.listarMinhas(usuario.id);
  }

  // ── Gerente: ver pendentes da equipe ──────────────────────────
  @Get('pendentes')
  @Roles(PerfilUsuario.GERENTE)
  @ApiOperation({ summary: 'Lista pendentes da equipe do gerente logado' })
  listarPendentes(@UsuarioAtual() usuario: any) {
    return this.service.listarPendentes(usuario.id);
  }

  // ── RH/Direção/Gerente: listar todas com filtros ──────────────
  @Get()
  @Roles(PerfilUsuario.GERENTE, PerfilUsuario.RH, PerfilUsuario.DIRECAO)
  @ApiOperation({ summary: 'Lista todas as justificativas com filtros (Gerente/RH/Direção)' })
  @ApiQuery({ name: 'colaboradorId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: StatusJustificativa })
  @ApiQuery({ name: 'dataInicio', required: false, example: '2024-06-01' })
  @ApiQuery({ name: 'dataFim', required: false, example: '2024-06-30' })
  listarTodas(
    @Query('colaboradorId') colaboradorId?: string,
    @Query('status') status?: StatusJustificativa,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.service.listarTodas({ colaboradorId, status, dataInicio, dataFim });
  }

  // ── Detalhe de uma justificativa ──────────────────────────────
  @Get(':id')
  @Roles(PerfilUsuario.COLABORADOR, PerfilUsuario.GERENTE, PerfilUsuario.RH, PerfilUsuario.DIRECAO)
  @ApiOperation({ summary: 'Detalhe completo de uma justificativa' })
  detalhe(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAtual() usuario: any,
  ) {
    return this.service.detalhe(id, usuario);
  }

  // ── Gerente/Direção: avaliar ──────────────────────────────────
  @Patch(':id/avaliar')
  @Roles(PerfilUsuario.GERENTE, PerfilUsuario.DIRECAO)
  @ApiOperation({ summary: 'Aprova ou reprova uma justificativa (gerente/direção)' })
  avaliar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AvaliarJustificativaDto,
    @UsuarioAtual() usuario: any,
  ) {
    return this.service.avaliar(id, dto, usuario);
  }

  // ── RH: marcar ajuste lançado ─────────────────────────────────
  @Patch(':id/ajuste-lancado')
  @Roles(PerfilUsuario.RH)
  @ApiOperation({ summary: 'Marca ajuste de ponto como lançado (RH)' })
  marcarAjusteLancado(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.marcarAjusteLancado(id);
  }
}
