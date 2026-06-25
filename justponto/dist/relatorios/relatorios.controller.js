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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatoriosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const relatorios_service_1 = require("./relatorios.service");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const perfil_usuario_enum_1 = require("../common/enums/perfil-usuario.enum");
let RelatoriosController = class RelatoriosController {
    constructor(service) {
        this.service = service;
    }
    resumo() {
        return this.service.resumo();
    }
};
exports.RelatoriosController = RelatoriosController;
__decorate([
    (0, common_1.Get)('resumo'),
    (0, roles_decorator_1.Roles)(perfil_usuario_enum_1.PerfilUsuario.DIRECAO),
    (0, swagger_1.ApiOperation)({ summary: 'Resumo analítico completo (somente Direção)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RelatoriosController.prototype, "resumo", null);
exports.RelatoriosController = RelatoriosController = __decorate([
    (0, swagger_1.ApiTags)('relatorios'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.Controller)('relatorios'),
    __metadata("design:paramtypes", [relatorios_service_1.RelatoriosService])
], RelatoriosController);
//# sourceMappingURL=relatorios.controller.js.map