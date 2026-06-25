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
exports.AnexosService = void 0;
const common_1 = require("@nestjs/common");
const data_module_1 = require("../data/data.module");
const MIMES_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
const TAMANHO_MAX_BYTES = 5 * 1024 * 1024;
let AnexosService = class AnexosService {
    constructor(anexosRepo, storage, justificativasRepo) {
        this.anexosRepo = anexosRepo;
        this.storage = storage;
        this.justificativasRepo = justificativasRepo;
    }
    async upload(justificativaId, arquivo) {
        const justificativa = await this.justificativasRepo.findById(justificativaId);
        if (!justificativa) {
            throw new common_1.NotFoundException(`Justificativa ${justificativaId} não encontrada`);
        }
        if (!MIMES_PERMITIDOS.includes(arquivo.mimetype)) {
            throw new common_1.BadRequestException(`Tipo de arquivo não permitido. Use PDF, JPG ou PNG.`);
        }
        if (arquivo.size > TAMANHO_MAX_BYTES) {
            throw new common_1.BadRequestException(`Arquivo muito grande. Máximo permitido: 5MB.`);
        }
        const nomeSeguro = arquivo.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const { caminhoStorage } = await this.storage.upload(justificativaId, nomeSeguro, arquivo.buffer, arquivo.mimetype);
        return this.anexosRepo.create({
            justificativaId,
            nomeArquivo: nomeSeguro,
            caminhoStorage,
            tipoMime: arquivo.mimetype,
            tamanhoBytes: arquivo.size,
        });
    }
    async obterUrlDownload(id) {
        const anexo = await this.anexosRepo.findById(id);
        if (!anexo)
            throw new common_1.NotFoundException(`Anexo ${id} não encontrado`);
        const url = await this.storage.gerarUrlAssinada(anexo.caminhoStorage, 3600);
        return { url };
    }
    async listarPorJustificativa(justificativaId) {
        return this.anexosRepo.findByJustificativaId(justificativaId);
    }
};
exports.AnexosService = AnexosService;
exports.AnexosService = AnexosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(data_module_1.ANEXOS_REPO)),
    __param(1, (0, common_1.Inject)(data_module_1.STORAGE_SERVICE)),
    __param(2, (0, common_1.Inject)(data_module_1.JUSTIFICATIVAS_REPO)),
    __metadata("design:paramtypes", [Object, Object, Object])
], AnexosService);
//# sourceMappingURL=anexos.service.js.map