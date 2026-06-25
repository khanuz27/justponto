import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CriarTipoOcorrenciaDto {
  @ApiProperty({ example: 'Atestado médico' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional({ example: 'Ausência justificada por atestado médico' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  exigeAnexo: boolean;
}

export class AtualizarTipoOcorrenciaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  exigeAnexo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
