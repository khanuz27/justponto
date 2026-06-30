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
import { IAnexosRepositorio } from '../data/interfaces/anexos.repositorio.interface';
import { ANEXOS_REPO } from '../data/data.module';
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
    @Inject(ANEXOS_REPO)
    private readonly anexosRepo: IAnexosRepositorio,
  ) {}

  // ── Colaborador: criar justificativa ──────────────────────────
  async criar(
    dto: CriarJustificativaDto,
    colaboradorId: string,
    temAnexo: boolean,
  ): Promise<Justificativa> {
    const tipo = await this.tiposRepo.findById(dto.tipoOcorrenciaId);
    if (!tipo || !tipo.ativo) {
      throw new NotFoundException('Tipo de ocorrência não encontrado ou inativo');
    }

    if (tipo.exigeAnexo && !temAnexo) {
      throw new BadRequestException(
        `O tipo "${tipo.nome}" exige comprovante. Por favor, envie o anexo junto com a justificativa.`,
      );
    }

    // Derivar periodo das ocorrências
    let periodo = dto.periodo ?? Periodo.DIA_INTEIRO;
    let horaInicio = dto.horaInicio;
    let horaFim = dto.horaFim;

    if (dto.ocorrencias && dto.ocorrencias.length > 0) {
      const temDiaInteiro = dto.ocorrencias.some(o => o.tipo === 'dia_inteiro');
      if (temDiaInteiro) {
        periodo = Periodo.DIA_INTEIRO;
        horaInicio = undefined;
        horaFim = undefined;
      } else {
        periodo = Periodo.PARCIAL;
        // Usa o menor e maior horário como range
        const horarios = dto.ocorrencias
          .map(o => o.horarioCorreto)
          .filter(Boolean)
          .sort() as string[];
        if (horarios.length > 0) {
          horaInicio = horarios[0];
          horaFim = horarios.length > 1 ? horarios[horarios.length - 1] : horarios[0];
          // Se os horários forem iguais, adiciona 1 min ao fim para satisfazer chk_horas (inicio < fim)
          if (horaInicio === horaFim) {
            const [h, m] = horaFim.split(':').map(Number);
            const totalMin = h * 60 + m + 1;
            horaFim = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
          }
        }
      }
    }

    const nova = await this.justificativasRepo.create({
      colaboradorId,
      tipoOcorrenciaId: dto.tipoOcorrenciaId,
      dataOcorrencia: dto.dataOcorrencia,
      periodo,
      horaInicio,
      horaFim,
      descricao: dto.descricao,
      motivoOutros: dto.motivoOutros,
      status: StatusJustificativa.PENDENTE,
      aprovadorId: undefined,
      comentarioAvaliacao: undefined,
      avaliadoEm: undefined,
    });

    // Salvar ocorrências na tabela filha
    if (dto.ocorrencias && dto.ocorrencias.length > 0) {
      await this.justificativasRepo.createOcorrencias(
        nova.id,
        dto.ocorrencias.map(o => ({ tipo: o.tipo, horarioCorreto: o.horarioCorreto })),
      );
    }

    // Registrar no histórico
    await this.historicoRepo.create({
      justificativaId: nova.id,
      statusAnterior: undefined,
      statusNovo: StatusJustificativa.PENDENTE,
      alteradoPorId: colaboradorId,
      comentario: 'Justificativa criada',
    });

    // Notificar gerente
    await this.notificarGerente(nova.id, colaboradorId, tipo.nome);

    return nova;
  }

  // ── Helper: popular ocorrências em batch ────────────────────────
  private async popularOcorrencias(justificativas: Justificativa[]): Promise<Justificativa[]> {
    if (justificativas.length === 0) return justificativas;
    const results = await Promise.all(
      justificativas.map(j => this.justificativasRepo.findOcorrenciasByJustificativaId(j.id)),
    );
    return justificativas.map((j, i) => ({ ...j, ocorrencias: results[i] }));
  }

  // ── Colaborador: ver as próprias justificativas ───────────────
  async listarMinhas(colaboradorId: string): Promise<Justificativa[]> {
    const lista = await this.justificativasRepo.findByColaboradorId(colaboradorId);
    return this.popularOcorrencias(lista);
  }

  // ── Gerente: ver pendentes da equipe ──────────────────────────
  async listarPendentes(gerenteId: string): Promise<Justificativa[]> {
    const lista = await this.justificativasRepo.findPendentesByGerenteId(gerenteId);
    return this.popularOcorrencias(lista);
  }

  // ── RH/Direção: listar todas com filtros ──────────────────────
  async listarTodas(filtro: FiltroJustificativas): Promise<Justificativa[]> {
    const lista = await this.justificativasRepo.findAll(filtro);
    return this.popularOcorrencias(lista);
  }

  // ── Detalhe completo de uma justificativa ─────────────────────
  async detalhe(id: string, solicitante: { id: string; perfil: PerfilUsuario }) {
    const justificativa = await this.justificativasRepo.findById(id);
    if (!justificativa) throw new NotFoundException(`Justificativa ${id} não encontrada`);

    // Colaborador só pode ver as próprias
    if (
      solicitante.perfil === PerfilUsuario.COLABORADOR &&
      justificativa.colaboradorId !== solicitante.id
    ) {
      throw new ForbiddenException('Acesso negado');
    }

    const [ocorrencias, anexos, colaborador, aprovador] = await Promise.all([
      this.justificativasRepo.findOcorrenciasByJustificativaId(id),
      this.anexosRepo.findByJustificativaId(id),
      this.usuariosRepo.findById(justificativa.colaboradorId),
      justificativa.aprovadorId
        ? this.usuariosRepo.findById(justificativa.aprovadorId)
        : Promise.resolve(null),
    ]);

    const tipo = await this.tiposRepo.findById(justificativa.tipoOcorrenciaId);

    return {
      ...justificativa,
      ocorrencias,
      anexos,
      colaboradorNome: colaborador?.nome ?? '',
      colaboradorEmail: colaborador?.email ?? '',
      aprovadorNome: aprovador?.nome ?? undefined,
      tipoNome: tipo?.nome ?? '',
    };
  }

  // ── Gerente/Direção: avaliar justificativa ────────────────────
  async avaliar(
    id: string,
    dto: AvaliarJustificativaDto,
    avaliador: { id: string; perfil: PerfilUsuario; gerenteId?: string },
  ): Promise<Justificativa> {
    const justificativa = await this.justificativasRepo.findById(id);
    if (!justificativa) throw new NotFoundException(`Justificativa ${id} não encontrada`);

    if (justificativa.status !== StatusJustificativa.PENDENTE) {
      throw new BadRequestException('Esta justificativa já foi avaliada e não pode ser alterada');
    }

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

    await this.historicoRepo.create({
      justificativaId: id,
      statusAnterior,
      statusNovo: dto.status,
      alteradoPorId: avaliador.id,
      comentario: dto.comentario,
    });

    return atualizada!;
  }

  // ── RH: marcar ajuste lançado ─────────────────────────────────
  async marcarAjusteLancado(id: string): Promise<Justificativa> {
    const justificativa = await this.justificativasRepo.findById(id);
    if (!justificativa) throw new NotFoundException(`Justificativa ${id} não encontrada`);
    return (await this.justificativasRepo.marcarAjusteLancado(id, true))!;
  }

  // ── Privado: notificar gerente ────────────────────────────────
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
