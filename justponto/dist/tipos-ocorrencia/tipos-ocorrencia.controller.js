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
exports.TiposOcorrenciaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tipos_ocorrencia_service_1 = require("./tipos-ocorrencia.service");
const tipo_ocorrencia_dto_1 = require("./dto/tipo-ocorrencia.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const perfil_usuario_enum_1 = require("../common/enums/perfil-usuario.enum");
let TiposOcorrenciaController = class TiposOcorrenciaController {
    constructor(service) {
        this.service = service;
    }
    listar() {
        return this.service.listar();
    }
    criar(dto) {
        return this.service.criar(dto);
    }
    atualizar(id, dto) {
        return this.service.atualizar(id, dto);
    }
    remover(id) {
        return this.service.remover(id);
    }
};
exports.TiposOcorrenciaController = TiposOcorrenciaController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista todos os tipos de ocorrência ativos (qualquer autenticado)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TiposOcorrenciaController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(perfil_usuario_enum_1.PerfilUsuario.RH, perfil_usuario_enum_1.PerfilUsuario.DIRECAO),
    (0, swagger_1.ApiOperation)({ summary: 'Cria novo tipo (RH/Direção)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tipo_ocorrencia_dto_1.CriarTipoOcorrenciaDto]),
    __metadata("design:returntype", void 0)
], TiposOcorrenciaController.prototype, "criar", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(perfil_usuario_enum_1.PerfilUsuario.RH, perfil_usuario_enum_1.PerfilUsuario.DIRECAO),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza tipo (RH/Direção)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tipo_ocorrencia_dto_1.AtualizarTipoOcorrenciaDto]),
    __metadata("design:returntype", void 0)
], TiposOcorrenciaController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(perfil_usuario_enum_1.PerfilUsuario.RH, perfil_usuario_enum_1.PerfilUsuario.DIRECAO),
    (0, swagger_1.ApiOperation)({ summary: 'Desativa tipo (RH/Direção)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TiposOcorrenciaController.prototype, "remover", null);
exports.TiposOcorrenciaController = TiposOcorrenciaController = __decorate([
    (0, swagger_1.ApiTags)('tipos-ocorrencia'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.Controller)('tipos-ocorrencia'),
    __metadata("design:paramtypes", [tipos_ocorrencia_service_1.TiposOcorrenciaService])
], TiposOcorrenciaController);
//# sourceMappingURL=tipos-ocorrencia.controller.js.map