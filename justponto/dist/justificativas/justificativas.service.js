"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JustificativasService = void 0;
const common_1 = require("@nestjs/common");
const data_module_1 = require("../data/data.module");
const status_justificativa_enum_1 = require("../common/enums/status-justificativa.enum");
const perfil_usuario_enum_1 = require("../common/enums/perfil-usuario.enum");
const periodo_enum_1 = require("../common/enums/periodo.enum");
let JustificativasService = class JustificativasService {
    constructor(justificativasRepo, tiposRepo, historicoRepo, notificacoesRepo, emailService, usuariosRepo) {
        this.justificativasRepo = justificativasRepo;
        this.tiposRepo = tiposRepo;
        this.historicoRepo = historicoRepo;
        this.notificacoesRepo = notificacoesRepo;
        this.emailService = emailService;
        this.usuariosRepo = usuariosRepo;
    }
    async criar(dto, colaboradorId, temAnexo) {
        const tipo = await this.tiposRepo.findById(dto.tipoOcorrenciaId);
        if (!tipo || !tipo.ativo) {
            throw new common_1.NotFoundException('Tipo de ocorrência não encontrado ou inativo');
        }
        if (tipo.exigeAnexo && !temAnexo) {
            throw new common_1.BadRequestException(`O tipo "${tipo.nome}" exige comprovante. Por favor, envie o anexo junto com a justificativa.`);
        }
        const nova = await this.justificativasRepo.create({
            colaboradorId,
            tipoOcorrenciaId: dto.tipoOcorrenciaId,
            dataOcorrencia: dto.dataOcorrencia,
            periodo: dto.periodo ?? periodo_enum_1.Periodo.DIA_INTEIRO,
            horaInicio: dto.horaInicio,
            horaFim: dto.horaFim,
            descricao: dto.descricao,
            status: status_justificativa_enum_1.StatusJustificativa.PENDENTE,
            aprovadorId: undefined,
            comentarioAvaliacao: undefined,
            avaliadoEm: undefined,
        });
        await this.historicoRepo.create({
            justificativaId: nova.id,
            statusAnterior: undefined,
            statusNovo: status_justificativa_enum_1.StatusJustificativa.PENDENTE,
            alteradoPorId: colaboradorId,
            comentario: 'Justificativa criada',
        });
        await this.notificarGerente(nova.id, colaboradorId, tipo.nome);
        return nova;
    }
    async listarMinhas(colaboradorId) {
        return this.justificativasRepo.findByColaboradorId(colaboradorId);
    }
    async listarPendentes(gerenteId) {
        return this.justificativasRepo.findPendentesByGerenteId(gerenteId);
    }
    async listarTodas(filtro) {
        return this.justificativasRepo.findAll(filtro);
    }
    async avaliar(id, dto, avaliador) {
        const justificativa = await this.justificativasRepo.findById(id);
        if (!justificativa)
            throw new common_1.NotFoundException(`Justificativa ${id} não encontrada`);
        if (justificativa.status !== status_justificativa_enum_1.StatusJustificativa.PENDENTE) {
            throw new common_1.BadRequestException('Esta justificativa já foi avaliada e não pode ser alterada');
        }
        if (avaliador.perfil === perfil_usuario_enum_1.PerfilUsuario.GERENTE) {
            const colaborador = await this.usuariosRepo.findById(justificativa.colaboradorId);
            if (!colaborador || colaborador.gerenteId !== avaliador.id) {
                throw new common_1.ForbiddenException('Você só pode avaliar justificativas de colaboradores da sua equipe');
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
        return atualizada;
    }
    async marcarAjusteLancado(id) {
        const justificativa = await this.justificativasRepo.findById(id);
        if (!justificativa)
            throw new common_1.NotFoundException(`Justificativa ${id} não encontrada`);
        return (await this.justificativasRepo.marcarAjusteLancado(id, true));
    }
    async notificarGerente(justificativaId, colaboradorId, tipoNome) {
        const colaborador = await this.usuariosRepo.findById(colaboradorId);
        if (!colaborador?.gerenteId)
            return;
        const gerente = await this.usuariosRepo.findById(colaborador.gerenteId);
        if (!gerente)
            return;
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
};
exports.JustificativasService = JustificativasService;
exports.JustificativasService = JustificativasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(data_module_1.JUSTIFICATIVAS_REPO)),
    __param(1, (0, common_1.Inject)(data_module_1.TIPOS_OCORRENCIA_REPO)),
    __param(2, (0, common_1.Inject)(data_module_1.HISTORICO_REPO)),
    __param(3, (0, common_1.Inject)(data_module_1.NOTIFICACOES_REPO)),
    __param(4, (0, common_1.Inject)(data_module_1.EMAIL_SERVICE)),
    __param(5, (0, common_1.Inject)(data_module_1.USUARIOS_REPO)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], JustificativasService);
//# sourceMappingURL=justificativas.service.js.map