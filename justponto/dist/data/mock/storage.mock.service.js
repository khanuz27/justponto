"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StorageMockService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageMockService = void 0;
const common_1 = require("@nestjs/common");
let StorageMockService = StorageMockService_1 = class StorageMockService {
    constructor() {
        this.logger = new common_1.Logger(StorageMockService_1.name);
        this.arquivos = new Map();
    }
    async upload(justificativaId, nomeArquivo, buffer, tipoMime) {
        const caminhoStorage = `mock/${justificativaId}/${Date.now()}-${nomeArquivo}`;
        this.arquivos.set(caminhoStorage, { buffer, mime: tipoMime });
        this.logger.log(`[MOCK-STORAGE] Upload salvo em memória: ${caminhoStorage} (${buffer.length} bytes, ${tipoMime})`);
        return { caminhoStorage };
    }
    async gerarUrlAssinada(caminhoStorage, expiracaoSegundos = 3600) {
        const url = `http://localhost:3000/mock-storage/${caminhoStorage}?expires=${Date.now() + expiracaoSegundos * 1000}`;
        this.logger.log(`[MOCK-STORAGE] URL assinada simulada: ${url}`);
        return url;
    }
    async remover(caminhoStorage) {
        this.arquivos.delete(caminhoStorage);
        this.logger.log(`[MOCK-STORAGE] Removido da memória: ${caminhoStorage}`);
    }
    obterArquivo(caminhoStorage) {
        return this.arquivos.get(caminhoStorage);
    }
};
exports.StorageMockService = StorageMockService;
exports.StorageMockService = StorageMockService = StorageMockService_1 = __decorate([
    (0, common_1.Injectable)()
], StorageMockService);
//# sourceMappingURL=storage.mock.service.js.map