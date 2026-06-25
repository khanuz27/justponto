"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JustificativasModule = void 0;
const common_1 = require("@nestjs/common");
const justificativas_service_1 = require("./justificativas.service");
const justificativas_controller_1 = require("./justificativas.controller");
const data_module_1 = require("../data/data.module");
const anexos_module_1 = require("../anexos/anexos.module");
let JustificativasModule = class JustificativasModule {
};
exports.JustificativasModule = JustificativasModule;
exports.JustificativasModule = JustificativasModule = __decorate([
    (0, common_1.Module)({
        imports: [data_module_1.DataModule, anexos_module_1.AnexosModule],
        controllers: [justificativas_controller_1.JustificativasController],
        providers: [justificativas_service_1.JustificativasService],
        exports: [justificativas_service_1.JustificativasService],
    })
], JustificativasModule);
//# sourceMappingURL=justificativas.module.js.map