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
exports.RelatoriosService = void 0;
const common_1 = require("@nestjs/common");
const data_module_1 = require("../data/data.module");
const status_justificativa_enum_1 = require("../common/enums/status-justificativa.enum");
const periodo_enum_1 = require("../common/enums/periodo.enum");
let RelatoriosService = class RelatoriosService {
    constructor(justificativasRepo, usuariosRepo, tiposRepo) {
        this.justificativasRepo = justificativasRepo;
        this.usuariosRepo = usuariosRepo;
        this.tiposRepo = tiposRepo;
    }
    async resumo() {
        const [todas, usuarios, tipos] = await Promise.all([
            this.justificativasRepo.findAll(),
            this.usuariosRepo.findAll(),
            this.tiposRepo.findAll(false),
        ]);
        const totalPorStatus = {
            pendente: 0,
            aprovada: 0,
            reprovada: 0,
        };
        for (const j of todas) {
            totalPorStatus[j.status]++;
        }
        const porColaborador = {};
        for (const j of todas) {
            if (!porColaborador[j.colaboradorId]) {
                const usuario = usuarios.find((u) => u.id === j.colaboradorId);
                porColaborador[j.colaboradorId] = {
                    nome: usuario?.nome ?? j.colaboradorId,
                    total: 0,
                    pendentes: 0,
                    aprovadas: 0,
                    reprovadas: 0,
                    diasJustificados: 0,
                    horasJustificadas: 0,
                };
            }
            const reg = porColaborador[j.colaboradorId];
            reg.total++;
            if (j.status === status_justificativa_enum_1.StatusJustificativa.PENDENTE)
                reg.pendentes++;
            if (j.status === status_justificativa_enum_1.StatusJustificativa.APROVADA)
                reg.aprovadas++;
            if (j.status === status_justificativa_enum_1.StatusJustificativa.REPROVADA)
                reg.reprovadas++;
            if (j.status === status_justificativa_enum_1.StatusJustificativa.APROVADA) {
                if (j.periodo === periodo_enum_1.Periodo.DIA_INTEIRO) {
                    reg.diasJustificados += 1;
                    reg.horasJustificadas += 8;
                }
                else if (j.horaInicio && j.horaFim) {
                    const [hIni, mIni] = j.horaInicio.split(':').map(Number);
                    const [hFim, mFim] = j.horaFim.split(':').map(Number);
                    const horas = (hFim * 60 + mFim - (hIni * 60 + mIni)) / 60;
                    reg.horasJustificadas += Math.max(0, horas);
                    reg.diasJustificados += horas >= 4 ? 0.5 : 0;
                }
            }
        }
        const contagemMotivos = {};
        for (const j of todas) {
            contagemMotivos[j.tipoOcorrenciaId] = (contagemMotivos[j.tipoOcorrenciaId] ?? 0) + 1;
        }
        const rankingMotivos = Object.entries(contagemMotivos)
            .map(([tipoId, total]) => {
            const tipo = tipos.find((t) => t.id === tipoId);
            return { tipoId, nome: tipo?.nome ?? tipoId, total };
        })
            .sort((a, b) => b.total - a.total);
        return {
            totalGeral: todas.length,
            totalPorStatus,
            porColaborador: Object.values(porColaborador),
            rankingMotivos,
        };
    }
};
exports.RelatoriosService = RelatoriosService;
exports.RelatoriosService = RelatoriosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(data_module_1.JUSTIFICATIVAS_REPO)),
    __param(1, (0, common_1.Inject)(data_module_1.USUARIOS_REPO)),
    __param(2, (0, common_1.Inject)(data_module_1.TIPOS_OCORRENCIA_REPO)),
    __metadata("design:paramtypes", [Object, Object, Object])
], RelatoriosService);
//# sourceMappingURL=relatorios.service.js.map