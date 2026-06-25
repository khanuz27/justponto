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
exports.JustificativasController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const justificativas_service_1 = require("./justificativas.service");
const criar_justificativa_dto_1 = require("./dto/criar-justificativa.dto");
const avaliar_justificativa_dto_1 = require("./dto/avaliar-justificativa.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const usuario_atual_decorator_1 = require("../common/decorators/usuario-atual.decorator");
const perfil_usuario_enum_1 = require("../common/enums/perfil-usuario.enum");
const status_justificativa_enum_1 = require("../common/enums/status-justificativa.enum");
let JustificativasController = class JustificativasController {
    constructor(service) {
        this.service = service;
    }
    criar(dto, usuario, arquivo) {
        return this.service.criar(dto, usuario.id, !!arquivo);
    }
    listarMinhas(usuario) {
        return this.service.listarMinhas(usuario.id);
    }
    listarPendentes(usuario) {
        return this.service.listarPendentes(usuario.id);
    }
    listarTodas(colaboradorId, status, dataInicio, dataFim) {
        return this.service.listarTodas({ colaboradorId, status, dataInicio, dataFim });
    }
    avaliar(id, dto, usuario) {
        return this.service.avaliar(id, dto, usuario);
    }
    marcarAjusteLancado(id) {
        return this.service.marcarAjusteLancado(id);
    }
};
exports.JustificativasController = JustificativasController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(perfil_usuario_enum_1.PerfilUsuario.COLABORADOR),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('anexo')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Cria nova justificativa (colaborador)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, usuario_atual_decorator_1.UsuarioAtual)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [criar_justificativa_dto_1.CriarJustificativaDto, Object, Object]),
    __metadata("design:returntype", void 0)
], JustificativasController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)('minhas'),
    (0, roles_decorator_1.Roles)(perfil_usuario_enum_1.PerfilUsuario.COLABORADOR),
    (0, swagger_1.ApiOperation)({ summary: 'Lista as justificativas do colaborador logado' }),
    __param(0, (0, usuario_atual_decorator_1.UsuarioAtual)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JustificativasController.prototype, "listarMinhas", null);
__decorate([
    (0, common_1.Get)('pendentes'),
    (0, roles_decorator_1.Roles)(perfil_usuario_enum_1.PerfilUsuario.GERENTE),
    (0, swagger_1.ApiOperation)({ summary: 'Lista pendentes da equipe do gerente logado' }),
    __param(0, (0, usuario_atual_decorator_1.UsuarioAtual)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JustificativasController.prototype, "listarPendentes", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(perfil_usuario_enum_1.PerfilUsuario.RH, perfil_usuario_enum_1.PerfilUsuario.DIRECAO),
    (0, swagger_1.ApiOperation)({ summary: 'Lista todas as justificativas com filtros (RH/Direção)' }),
    (0, swagger_1.ApiQuery)({ name: 'colaboradorId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: status_justificativa_enum_1.StatusJustificativa }),
    (0, swagger_1.ApiQuery)({ name: 'dataInicio', required: false, example: '2024-06-01' }),
    (0, swagger_1.ApiQuery)({ name: 'dataFim', required: false, example: '2024-06-30' }),
    __param(0, (0, common_1.Query)('colaboradorId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('dataInicio')),
    __param(3, (0, common_1.Query)('dataFim')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], JustificativasController.prototype, "listarTodas", null);
__decorate([
    (0, common_1.Patch)(':id/avaliar'),
    (0, roles_decorator_1.Roles)(perfil_usuario_enum_1.PerfilUsuario.GERENTE, perfil_usuario_enum_1.PerfilUsuario.DIRECAO),
    (0, swagger_1.ApiOperation)({ summary: 'Aprova ou reprova uma justificativa (gerente/direção)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, usuario_atual_decorator_1.UsuarioAtual)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, avaliar_justificativa_dto_1.AvaliarJustificativaDto, Object]),
    __metadata("design:returntype", void 0)
], JustificativasController.prototype, "avaliar", null);
__decorate([
    (0, common_1.Patch)(':id/ajuste-lancado'),
    (0, roles_decorator_1.Roles)(perfil_usuario_enum_1.PerfilUsuario.RH),
    (0, swagger_1.ApiOperation)({ summary: 'Marca ajuste de ponto como lançado (RH)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JustificativasController.prototype, "marcarAjusteLancado", null);
exports.JustificativasController = JustificativasController = __decorate([
    (0, swagger_1.ApiTags)('justificativas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.Controller)('justificativas'),
    __metadata("design:paramtypes", [justificativas_service_1.JustificativasService])
], JustificativasController);
//# sourceMappingURL=justificativas.controller.js.map