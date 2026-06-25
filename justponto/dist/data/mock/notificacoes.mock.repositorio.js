"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacoesMockRepositorio = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let NotificacoesMockRepositorio = class NotificacoesMockRepositorio {
    constructor() {
        this.notificacoes = [];
    }
    async findByJustificativaId(justificativaId) {
        return this.notificacoes.filter((n) => n.justificativaId === justificativaId);
    }
    async create(dados) {
        const nova = { ...dados, id: (0, uuid_1.v4)(), criadoEm: new Date() };
        this.notificacoes.push(nova);
        return nova;
    }
    async update(id, dados) {
        const idx = this.notificacoes.findIndex((n) => n.id === id);
        if (idx === -1)
            return null;
        this.notificacoes[idx] = { ...this.notificacoes[idx], ...dados };
        return this.notificacoes[idx];
    }
};
exports.NotificacoesMockRepositorio = NotificacoesMockRepositorio;
exports.NotificacoesMockRepositorio = NotificacoesMockRepositorio = __decorate([
    (0, common_1.Injectable)()
], NotificacoesMockRepositorio);
//# sourceMappingURL=notificacoes.mock.repositorio.js.map