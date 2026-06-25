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
exports.TiposOcorrenciaService = void 0;
const common_1 = require("@nestjs/common");
const data_module_1 = require("../data/data.module");
let TiposOcorrenciaService = class TiposOcorrenciaService {
    constructor(tiposRepo) {
        this.tiposRepo = tiposRepo;
    }
    async listar() {
        return this.tiposRepo.findAll(true);
    }
    async buscarPorId(id) {
        const tipo = await this.tiposRepo.findById(id);
        if (!tipo)
            throw new common_1.NotFoundException(`Tipo de ocorrência ${id} não encontrado`);
        return tipo;
    }
    async criar(dto) {
        return this.tiposRepo.create(dto);
    }
    async atualizar(id, dto) {
        const atualizado = await this.tiposRepo.update(id, dto);
        if (!atualizado)
            throw new common_1.NotFoundException(`Tipo de ocorrência ${id} não encontrado`);
        return atualizado;
    }
    async remover(id) {
        const removido = await this.tiposRepo.remove(id);
        if (!removido)
            throw new common_1.NotFoundException(`Tipo de ocorrência ${id} não encontrado`);
        return { mensagem: 'Tipo de ocorrência desativado com sucesso' };
    }
};
exports.TiposOcorrenciaService = TiposOcorrenciaService;
exports.TiposOcorrenciaService = TiposOcorrenciaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(data_module_1.TIPOS_OCORRENCIA_REPO)),
    __metadata("design:paramtypes", [Object])
], TiposOcorrenciaService);
//# sourceMappingURL=tipos-ocorrencia.service.js.map