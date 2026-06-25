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
const usuarios_supabase_repositorio_1 = require("./supabase/usuarios.supabase.repositorio");
const tipos_ocorrencia_supabase_repositorio_1 = require("./supabase/tipos-ocorrencia.supabase.repositorio");
const justificativas_supabase_repositorio_1 = require("./supabase/justificativas.supabase.repositorio");
const anexos_supabase_repositorio_1 = require("./supabase/anexos.supabase.repositorio");
const historico_supabase_repositorio_1 = require("./supabase/historico.supabase.repositorio");
const notificacoes_supabase_repositorio_1 = require("./supabase/notificacoes.supabase.repositorio");
const storage_supabase_service_1 = require("./supabase/storage.supabase.service");
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
            criarProvedor(exports.USUARIOS_REPO, usuarios_mock_repositorio_1.UsuariosMockRepositorio, usuarios_supabase_repositorio_1.UsuariosSupabaseRepositorio),
            criarProvedor(exports.TIPOS_OCORRENCIA_REPO, tipos_ocorrencia_mock_repositorio_1.TiposOcorrenciaMockRepositorio, tipos_ocorrencia_supabase_repositorio_1.TiposOcorrenciaSupabaseRepositorio),
            criarProvedor(exports.JUSTIFICATIVAS_REPO, justificativas_mock_repositorio_1.JustificativasMockRepositorio, justificativas_supabase_repositorio_1.JustificativasSupabaseRepositorio),
            criarProvedor(exports.ANEXOS_REPO, anexos_mock_repositorio_1.AnexosMockRepositorio, anexos_supabase_repositorio_1.AnexosSupabaseRepositorio),
            criarProvedor(exports.HISTORICO_REPO, historico_mock_repositorio_1.HistoricoMockRepositorio, historico_supabase_repositorio_1.HistoricoSupabaseRepositorio),
            criarProvedor(exports.NOTIFICACOES_REPO, notificacoes_mock_repositorio_1.NotificacoesMockRepositorio, notificacoes_supabase_repositorio_1.NotificacoesSupabaseRepositorio),
            criarProvedor(exports.STORAGE_SERVICE, storage_mock_service_1.StorageMockService, storage_supabase_service_1.StorageSupabaseService),
            criarProvedor(exports.EMAIL_SERVICE, email_fake_service_1.EmailFakeService),
            { provide: storage_mock_service_1.StorageMockService, useExisting: exports.STORAGE_SERVICE },
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
            storage_mock_service_1.StorageMockService,
        ],
    })
], DataModule);
//# sourceMappingURL=data.module.js.map