"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiposOcorrenciaModule = void 0;
const common_1 = require("@nestjs/common");
const tipos_ocorrencia_service_1 = require("./tipos-ocorrencia.service");
const tipos_ocorrencia_controller_1 = require("./tipos-ocorrencia.controller");
const data_module_1 = require("../data/data.module");
let TiposOcorrenciaModule = class TiposOcorrenciaModule {
};
exports.TiposOcorrenciaModule = TiposOcorrenciaModule;
exports.TiposOcorrenciaModule = TiposOcorrenciaModule = __decorate([
    (0, common_1.Module)({
        imports: [data_module_1.DataModule],
        controllers: [tipos_ocorrencia_controller_1.TiposOcorrenciaController],
        providers: [tipos_ocorrencia_service_1.TiposOcorrenciaService],
        exports: [tipos_ocorrencia_service_1.TiposOcorrenciaService],
    })
], TiposOcorrenciaModule);
//# sourceMappingURL=tipos-ocorrencia.module.js.map