"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnexosMockRepositorio = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let AnexosMockRepositorio = class AnexosMockRepositorio {
    constructor() {
        this.anexos = [];
    }
    async findById(id) {
        return this.anexos.find((a) => a.id === id) ?? null;
    }
    async findByJustificativaId(justificativaId) {
        return this.anexos.filter((a) => a.justificativaId === justificativaId);
    }
    async create(dados) {
        const novo = { ...dados, id: (0, uuid_1.v4)(), criadoEm: new Date() };
        this.anexos.push(novo);
        return novo;
    }
    async remove(id) {
        const idx = this.anexos.findIndex((a) => a.id === id);
        if (idx === -1)
            return false;
        this.anexos.splice(idx, 1);
        return true;
    }
};
exports.AnexosMockRepositorio = AnexosMockRepositorio;
exports.AnexosMockRepositorio = AnexosMockRepositorio = __decorate([
    (0, common_1.Injectable)()
], AnexosMockRepositorio);
//# sourceMappingURL=anexos.mock.repositorio.js.map