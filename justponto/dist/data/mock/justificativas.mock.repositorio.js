"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JustificativasMockRepositorio = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const status_justificativa_enum_1 = require("../../common/enums/status-justificativa.enum");
const mock_seed_1 = require("./mock.seed");
let JustificativasMockRepositorio = class JustificativasMockRepositorio {
    constructor() {
        this.justificativas = [...mock_seed_1.JUSTIFICATIVAS_SEED];
        this.colaboradorParaGerente = mock_seed_1.USUARIOS_SEED.reduce((acc, u) => {
            if (u.gerenteId)
                acc[u.id] = u.gerenteId;
            return acc;
        }, {});
    }
    async findById(id) {
        return this.justificativas.find((j) => j.id === id) ?? null;
    }
    async findByColaboradorId(colaboradorId) {
        return this.justificativas.filter((j) => j.colaboradorId === colaboradorId);
    }
    async findPendentesByGerenteId(gerenteId) {
        const colaboradoresDoGerente = Object.entries(this.colaboradorParaGerente)
            .filter(([, gId]) => gId === gerenteId)
            .map(([cId]) => cId);
        return this.justificativas.filter((j) => colaboradoresDoGerente.includes(j.colaboradorId) &&
            j.status === status_justificativa_enum_1.StatusJustificativa.PENDENTE);
    }
    async findAll(filtro) {
        let resultado = [...this.justificativas];
        if (filtro?.colaboradorId) {
            resultado = resultado.filter((j) => j.colaboradorId === filtro.colaboradorId);
        }
        if (filtro?.status) {
            resultado = resultado.filter((j) => j.status === filtro.status);
        }
        if (filtro?.dataInicio) {
            resultado = resultado.filter((j) => j.dataOcorrencia >= filtro.dataInicio);
        }
        if (filtro?.dataFim) {
            resultado = resultado.filter((j) => j.dataOcorrencia <= filtro.dataFim);
        }
        return resultado;
    }
    async create(dados) {
        const nova = {
            ...dados,
            id: (0, uuid_1.v4)(),
            criadoEm: new Date(),
            atualizadoEm: new Date(),
        };
        this.justificativas.push(nova);
        return nova;
    }
    async update(id, dados) {
        const idx = this.justificativas.findIndex((j) => j.id === id);
        if (idx === -1)
            return null;
        this.justificativas[idx] = {
            ...this.justificativas[idx],
            ...dados,
            atualizadoEm: new Date(),
        };
        return this.justificativas[idx];
    }
    async marcarAjusteLancado(id, lancado) {
        return this.update(id, { atualizadoEm: new Date() });
    }
};
exports.JustificativasMockRepositorio = JustificativasMockRepositorio;
exports.JustificativasMockRepositorio = JustificativasMockRepositorio = __decorate([
    (0, common_1.Injectable)()
], JustificativasMockRepositorio);
//# sourceMappingURL=justificativas.mock.repositorio.js.map