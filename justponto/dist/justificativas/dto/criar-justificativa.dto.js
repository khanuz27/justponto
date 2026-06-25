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
exports.CriarJustificativaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const periodo_enum_1 = require("../../common/enums/periodo.enum");
class CriarJustificativaDto {
    constructor() {
        this.periodo = periodo_enum_1.Periodo.DIA_INTEIRO;
    }
}
exports.CriarJustificativaDto = CriarJustificativaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-do-tipo-ocorrencia' }),
    (0, class_validator_1.IsUUID)('4', { message: 'tipoOcorrenciaId deve ser um UUID válido' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CriarJustificativaDto.prototype, "tipoOcorrenciaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-06-25' }),
    (0, class_validator_1.IsDateString)({}, { message: 'dataOcorrencia deve ser uma data válida (YYYY-MM-DD)' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CriarJustificativaDto.prototype, "dataOcorrencia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: periodo_enum_1.Periodo, default: periodo_enum_1.Periodo.DIA_INTEIRO }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(periodo_enum_1.Periodo),
    __metadata("design:type", String)
], CriarJustificativaDto.prototype, "periodo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '08:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.periodo === periodo_enum_1.Periodo.PARCIAL),
    (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, { message: 'horaInicio deve estar no formato HH:mm' }),
    __metadata("design:type", String)
], CriarJustificativaDto.prototype, "horaInicio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '12:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.periodo === periodo_enum_1.Periodo.PARCIAL),
    (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, { message: 'horaFim deve estar no formato HH:mm' }),
    __metadata("design:type", String)
], CriarJustificativaDto.prototype, "horaFim", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Esqueci de registrar o ponto ao chegar.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Descrição é obrigatória' }),
    __metadata("design:type", String)
], CriarJustificativaDto.prototype, "descricao", void 0);
//# sourceMappingURL=criar-justificativa.dto.js.map