"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiposOcorrenciaMockRepositorio = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const mock_seed_1 = require("./mock.seed");
let TiposOcorrenciaMockRepositorio = class TiposOcorrenciaMockRepositorio {
    constructor() {
        this.tipos = [...mock_seed_1.TIPOS_SEED];
    }
    async findAll(apenasAtivos = true) {
        return apenasAtivos ? this.tipos.filter((t) => t.ativo) : this.tipos;
    }
    async findById(id) {
        return this.tipos.find((t) => t.id === id) ?? null;
    }
    async create(dto) {
        const novo = {
            id: (0, uuid_1.v4)(),
            nome: dto.nome,
            descricao: dto.descricao,
            exigeAnexo: dto.exigeAnexo,
            ativo: true,
            criadoEm: new Date(),
        };
        this.tipos.push(novo);
        return novo;
    }
    async update(id, dto) {
        const idx = this.tipos.findIndex((t) => t.id === id);
        if (idx === -1)
            return null;
        this.tipos[idx] = { ...this.tipos[idx], ...dto };
        return this.tipos[idx];
    }
    async remove(id) {
        const idx = this.tipos.findIndex((t) => t.id === id);
        if (idx === -1)
            return false;
        this.tipos[idx].ativo = false;
        return true;
    }
};
exports.TiposOcorrenciaMockRepositorio = TiposOcorrenciaMockRepositorio;
exports.TiposOcorrenciaMockRepositorio = TiposOcorrenciaMockRepositorio = __decorate([
    (0, common_1.Injectable)()
], TiposOcorrenciaMockRepositorio);
//# sourceMappingURL=tipos-ocorrencia.mock.repositorio.js.map