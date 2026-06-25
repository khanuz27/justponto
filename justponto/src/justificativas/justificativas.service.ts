import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { IJustificativasRepositorio } from '../data/interfaces/justificativas.repositorio.interface';
import { ITiposOcorrenciaRepositorio } from '../data/interfaces/tipos-ocorrencia.repositorio.interface';
import { IHistoricoRepositorio } from '../data/interfaces/historico.repositorio.interface';
import { INotificacoesRepositorio } from '../data/interfaces/notificacoes.repositorio.interface';
import { IEmailService } from '../data/interfaces/email.service.interface';
import { IUsuariosRepositorio } from '../data/interfaces/usuarios.repositorio.interface';
import {
  JUSTIFICATIVAS_REPO,
  TIPOS_OCORRENCIA_REPO,
  HISTORICO_REPO,
  NOTIFICACOES_REPO,
  EMAIL_SERVICE,
  USUARIOS_REPO,
} from '../data/data.module';
import { CriarJustificativaDto } from './dto/criar-justificativa.dto';
import { AvaliarJustificativaDto } from './dto/avaliar-justificativa.dto';
import { StatusJustificativa } from '../common/enums/status-justificativa.enum';
import { PerfilUsuario } from '../common/enums/perfil-usuario.enum';
import { Periodo } from '../common/enums/periodo.enum';
import { Justificativa } from '../common/entities/justificativa.entity';
import { FiltroJustificativas } from '../data/interfaces/justificativas.repositorio.interface';

@Injectable()
export class JustificativasService {
  constructor(
    @Inject(JUSTIFICATIVAS_REPO)
    private readonly justificativasRepo: IJustificativasRepositorio,
    @Inject(TIPOS_OCORRENCIA_REPO)
    private readonly tiposRepo: ITiposOcorrenciaRepositorio,
    @Inject(HISTORICO_REPO)
    private readonly historicoRepo: IHistoricoRepositorio,
    @Inject(NOTIFICACOES_REPO)
    private readonly notificacoesRepo: INotificacoesRepositorio,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
    @Inject(USUARIOS_REPO)
    private readonly usuariosRepo: IUsuariosRepositorio,
  ) {}

  // ── Colaborador: criar justificativa (RN-01, RN-03, RN-07) ──────────────
  async criar(
    dto: CriarJustificativaDto,
    colaboradorId: string,
    temAnexo: boolean,
  ): Promise<Justificativa> {
    // Valida tipo de ocorrência
    const tipo = await this.tiposRepo.findById(dto.tipoOcorrenciaId);
    if (!tipo || !tipo.ativo) {
      throw new NotFoundException('Tipo de ocorrência não encontrado ou inativo');
    }

    // RN-03: anexo obrigatório se o tipo exigir
    if (tipo.exigeAnexo && !temAnexo) {
      throw new BadRequestException(
        `O tipo "${tipo.nome}" exige comprovante. Por favor, envie o anexo junto com a justificativa.`,
      );
    }

    // RN-01: nasce como pendente
    const nova = await this.justificativasRepo.create({
      colaboradorId,
      tipoOcorrenciaId: dto.tipoOcorrenciaId,
      dataOcorrencia: dto.dataOcorrencia,
      periodo: dto.periodo ?? Periodo.DIA_INTEIRO,
      horaInicio: dto.horaInicio,
      horaFim: dto.horaFim,
      descricao: dto.descricao,
      status: StatusJustificativa.PENDENTE,
      aprovadorId: undefined,
      comentarioAvaliacao: undefined,
      avaliadoEm: undefined,
    });

    // RN-05: registrar no histórico
    await this.historicoRepo.create({
      justificativaId: nova.id,
      statusAnterior: undefined,
      statusNovo: StatusJustificativa.PENDENTE,
      alteradoPorId: colaboradorId,
      comentario: 'Justificativa criada',
    });

    // Dispara notificação ao gerente (Tarefa 8)
    await this.notificarGerente(nova.id, colaboradorId, tipo.nome);

    return nova;
  }

  // ── Colaborador: ver as próprias justificativas (RN-04) ──────────────────
  async listarMinhas(colaboradorId: string): Promise<Justificativa[]> {
    return this.justificativasRepo.findByColaboradorId(colaboradorId);
  }

  // ── Gerente: ver pendentes da equipe (RN-04) ─────────────────────────────
  async listarPendentes(gerenteId: string): Promise<Justificativa[]> {
    return this.justificativasRepo.findPendentesByGerenteId(gerenteId);
  }

  // ── RH/Direção: listar todas com filtros (RN-04) ─────────────────────────
  async listarTodas(filtro: FiltroJustificativas): Promise<Justificativa[]> {
    return this.justificativasRepo.findAll(filtro);
  }

  // ── Gerente/Direção: avaliar justificativa (RN-02, RN-05, RN-06) ─────────
  async avaliar(
    id: string,
    dto: AvaliarJustificativaDto,
    avaliador: { id: string; perfil: PerfilUsuario; gerenteId?: string },
  ): Promise<Justificativa> {
    const justificativa = await this.justificativasRepo.findById(id);
    if (!justificativa) throw new NotFoundException(`Justificativa ${id} não encontrada`);

    // RN-06: justificativa avaliada não pode ser reavaliada por colaborador
    if (justificativa.status !== StatusJustificativa.PENDENTE) {
      throw new BadRequestException('Esta justificativa já foi avaliada e não pode ser alterada');
    }

    // RN-02: apenas gerente do colaborador ou direção pode avaliar
    if (avaliador.perfil === PerfilUsuario.GERENTE) {
      const colaborador = await this.usuariosRepo.findById(justificativa.colaboradorId);
      if (!colaborador || colaborador.gerenteId !== avaliador.id) {
        throw new ForbiddenException(
          'Você só pode avaliar justificativas de colaboradores da sua equipe',
        );
      }
    }

    const statusAnterior = justificativa.status;
    const atualizada = await this.justificativasRepo.update(id, {
      status: dto.status,
      aprovadorId: avaliador.id,
      comentarioAvaliacao: dto.comentario,
      avaliadoEm: new Date(),
    });

    // RN-05: registrar no histórico
    await this.historicoRepo.create({
      justificativaId: id,
      statusAnterior,
      statusNovo: dto.status,
      alteradoPorId: avaliador.id,
      comentario: dto.comentario,
    });

    return atualizada!;
  }

  // ── RH: marcar ajuste lançado ─────────────────────────────────────────────
  async marcarAjusteLancado(id: string): Promise<Justificativa> {
    const justificativa = await this.justificativasRepo.findById(id);
    if (!justificativa) throw new NotFoundException(`Justificativa ${id} não encontrada`);
    return (await this.justificativasRepo.marcarAjusteLancado(id, true))!;
  }

  // ── Privado: notificar gerente ────────────────────────────────────────────
  private async notificarGerente(
    justificativaId: string,
    colaboradorId: string,
    tipoNome: string,
  ): Promise<void> {
    const colaborador = await this.usuariosRepo.findById(colaboradorId);
    if (!colaborador?.gerenteId) return;

    const gerente = await this.usuariosRepo.findById(colaborador.gerenteId);
    if (!gerente) return;

    const notificacao = await this.notificacoesRepo.create({
      justificativaId,
      destinatarioId: gerente.id,
      canal: 'email',
      assunto: `[JustPonto] Nova justificativa de ${colaborador.nome}`,
      enviadoEm: undefined,
      statusEnvio: 'pendente',
      erro: undefined,
    });

    const resultado = await this.emailService.enviar({
      para: gerente.email,
      assunto: `[JustPonto] Nova justificativa de ${colaborador.nome}`,
      corpo: `Olá ${gerente.nome},\n\n${colaborador.nome} registrou uma nova justificativa.\nMotivo: ${tipoNome}\n\nAcesse o sistema para avaliar.`,
    });

    await this.notificacoesRepo.update(notificacao.id, {
      statusEnvio: resultado.sucesso ? 'enviado' : 'falha',
      enviadoEm: resultado.sucesso ? new Date() : undefined,
      erro: resultado.erro,
    });
  }
}
