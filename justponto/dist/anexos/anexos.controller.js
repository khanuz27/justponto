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
exports.AnexosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const anexos_service_1 = require("./anexos.service");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const perfil_usuario_enum_1 = require("../common/enums/perfil-usuario.enum");
let AnexosController = class AnexosController {
    constructor(service) {
        this.service = service;
    }
    upload(justificativaId, arquivo) {
        if (!arquivo)
            throw new common_1.BadRequestException('Arquivo é obrigatório');
        return this.service.upload(justificativaId, arquivo);
    }
    download(id) {
        return this.service.obterUrlDownload(id);
    }
    listarPorJustificativa(justificativaId) {
        return this.service.listarPorJustificativa(justificativaId);
    }
};
exports.AnexosController = AnexosController;
__decorate([
    (0, common_1.Post)(':justificativaId'),
    (0, roles_decorator_1.Roles)(perfil_usuario_enum_1.PerfilUsuario.COLABORADOR),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('arquivo', { limits: { fileSize: 5 * 1024 * 1024 } })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: { arquivo: { type: 'string', format: 'binary' } },
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Faz upload de comprovante (colaborador)' }),
    __param(0, (0, common_1.Param)('justificativaId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnexosController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtém URL assinada para download do anexo' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnexosController.prototype, "download", null);
__decorate([
    (0, common_1.Get)('justificativa/:justificativaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lista anexos de uma justificativa' }),
    __param(0, (0, common_1.Param)('justificativaId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnexosController.prototype, "listarPorJustificativa", null);
exports.AnexosController = AnexosController = __decorate([
    (0, swagger_1.ApiTags)('anexos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.Controller)('anexos'),
    __metadata("design:paramtypes", [anexos_service_1.AnexosService])
], AnexosController);
//# sourceMappingURL=anexos.controller.js.map