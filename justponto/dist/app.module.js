"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const data_module_1 = require("./data/data.module");
const auth_module_1 = require("./auth/auth.module");
const tipos_ocorrencia_module_1 = require("./tipos-ocorrencia/tipos-ocorrencia.module");
const justificativas_module_1 = require("./justificativas/justificativas.module");
const anexos_module_1 = require("./anexos/anexos.module");
const relatorios_module_1 = require("./relatorios/relatorios.module");
const usuarios_module_1 = require("./usuarios/usuarios.module");
const mock_storage_module_1 = require("./mock-storage/mock-storage.module");
const health_module_1 = require("./health/health.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            data_module_1.DataModule,
            auth_module_1.AuthModule,
            tipos_ocorrencia_module_1.TiposOcorrenciaModule,
            justificativas_module_1.JustificativasModule,
            anexos_module_1.AnexosModule,
            relatorios_module_1.RelatoriosModule,
            usuarios_module_1.UsuariosModule,
            mock_storage_module_1.MockStorageModule,
            health_module_1.HealthModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map