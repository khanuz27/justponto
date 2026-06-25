"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoricoMockRepositorio = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const mock_seed_1 = require("./mock.seed");
const status_justificativa_enum_1 = require("../../common/enums/status-justificativa.enum");
let HistoricoMockRepositorio = class HistoricoMockRepositorio {
    constructor() {
        this.historico = [
            {
                id: (0, uuid_1.v4)(),
                justificativaId: mock_seed_1.SEED_IDS.just2,
                statusAnterior: status_justificativa_enum_1.StatusJustificativa.PENDENTE,
                statusNovo: status_justificativa_enum_1.StatusJustificativa.APROVADA,
                alteradoPorId: mock_seed_1.SEED_IDS.gerente,
                comentario: 'Confirmado pelo noticiário.',
                criadoEm: new Date('2024-06-06T14:00:00Z'),
            },
        ];
    }
    async findByJustificativaId(justificativaId) {
        return this.historico.filter((h) => h.justificativaId === justificativaId);
    }
    async create(dados) {
        const novo = { ...dados, id: (0, uuid_1.v4)(), criadoEm: new Date() };
        this.historico.push(novo);
        return novo;
    }
};
exports.HistoricoMockRepositorio = HistoricoMockRepositorio;
exports.HistoricoMockRepositorio = HistoricoMockRepositorio = __decorate([
    (0, common_1.Injectable)()
], HistoricoMockRepositorio);
//# sourceMappingURL=historico.mock.repositorio.js.map