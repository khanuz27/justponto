"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataModule = exports.EMAIL_SERVICE = exports.STORAGE_SERVICE = exports.NOTIFICACOES_REPO = exports.HISTORICO_REPO = exports.ANEXOS_REPO = exports.JUSTIFICATIVAS_REPO = exports.TIPOS_OCORRENCIA_REPO = exports.USUARIOS_REPO = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
exports.USUARIOS_REPO = 'USUARIOS_REPO';
exports.TIPOS_OCORRENCIA_REPO = 'TIPOS_OCORRENCIA_REPO';
exports.JUSTIFICATIVAS_REPO = 'JUSTIFICATIVAS_REPO';
exports.ANEXOS_REPO = 'ANEXOS_REPO';
exports.HISTORICO_REPO = 'HISTORICO_REPO';
exports.NOTIFICACOES_REPO = 'NOTIFICACOES_REPO';
exports.STORAGE_SERVICE = 'STORAGE_SERVICE';
exports.EMAIL_SERVICE = 'EMAIL_SERVICE';
const usuarios_mock_repositorio_1 = require("./mock/usuarios.mock.repositorio");
const tipos_ocorrencia_mock_repositorio_1 = require("./mock/tipos-ocorrencia.mock.repositorio");
const justificativas_mock_repositorio_1 = require("./mock/justificativas.mock.repositorio");
const anexos_mock_repositorio_1 = require("./mock/anexos.mock.repositorio");
const historico_mock_repositorio_1 = require("./mock/historico.mock.repositorio");
const notificacoes_mock_repositorio_1 = require("./mock/notificacoes.mock.repositorio");
const storage_mock_service_1 = require("./mock/storage.mock.service");
const email_fake_service_1 = require("./mock/email.fake.service");
function criarProvedor(token, mockClass, supabaseClass) {
    return {
        provide: token,
        useFactory: (config) => {
            const source = config.get('DATA_SOURCE', 'mock');
            if (source === 'supabase' && supabaseClass) {
                return new supabaseClass(config);
            }
            return new mockClass();
        },
        inject: [config_1.ConfigService],
    };
}
let DataModule = class DataModule {
};
exports.DataModule = DataModule;
exports.DataModule = DataModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            criarProvedor(exports.USUARIOS_REPO, usuarios_mock_repositorio_1.UsuariosMockRepositorio),
            criarProvedor(exports.TIPOS_OCORRENCIA_REPO, tipos_ocorrencia_mock_repositorio_1.TiposOcorrenciaMockRepositorio),
            criarProvedor(exports.JUSTIFICATIVAS_REPO, justificativas_mock_repositorio_1.JustificativasMockRepositorio),
            criarProvedor(exports.ANEXOS_REPO, anexos_mock_repositorio_1.AnexosMockRepositorio),
            criarProvedor(exports.HISTORICO_REPO, historico_mock_repositorio_1.HistoricoMockRepositorio),
            criarProvedor(exports.NOTIFICACOES_REPO, notificacoes_mock_repositorio_1.NotificacoesMockRepositorio),
            criarProvedor(exports.STORAGE_SERVICE, storage_mock_service_1.StorageMockService),
            criarProvedor(exports.EMAIL_SERVICE, email_fake_service_1.EmailFakeService),
        ],
        exports: [
            exports.USUARIOS_REPO,
            exports.TIPOS_OCORRENCIA_REPO,
            exports.JUSTIFICATIVAS_REPO,
            exports.ANEXOS_REPO,
            exports.HISTORICO_REPO,
            exports.NOTIFICACOES_REPO,
            exports.STORAGE_SERVICE,
            exports.EMAIL_SERVICE,
        ],
    })
], DataModule);
//# sourceMappingURL=data.module.js.map