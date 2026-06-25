import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Periodo } from '../../common/enums/periodo.enum';

export class CriarJustificativaDto {
  @ApiProperty({ example: 'uuid-do-tipo-ocorrencia' })
  @IsUUID('4', { message: 'tipoOcorrenciaId deve ser um UUID válido' })
  @IsNotEmpty()
  tipoOcorrenciaId: string;

  @ApiProperty({ example: '2024-06-25' })
  @IsDateString({}, { message: 'dataOcorrencia deve ser uma data válida (YYYY-MM-DD)' })
  @IsNotEmpty()
  dataOcorrencia: string;

  @ApiPropertyOptional({ enum: Periodo, default: Periodo.DIA_INTEIRO })
  @IsOptional()
  @IsEnum(Periodo)
  periodo?: Periodo = Periodo.DIA_INTEIRO;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @ValidateIf((o) => o.periodo === Periodo.PARCIAL)
  @Matches(/^\d{2}:\d{2}$/, { message: 'horaInicio deve estar no formato HH:mm' })
  horaInicio?: string;

  @ApiPropertyOptional({ example: '12:00' })
  @IsOptional()
  @ValidateIf((o) => o.periodo === Periodo.PARCIAL)
  @Matches(/^\d{2}:\d{2}$/, { message: 'horaFim deve estar no formato HH:mm' })
  horaFim?: string;

  @ApiProperty({ example: 'Esqueci de registrar o ponto ao chegar.' })
  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  descricao: string;
}
