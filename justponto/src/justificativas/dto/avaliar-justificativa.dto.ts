import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusJustificativa } from '../../common/enums/status-justificativa.enum';

export class AvaliarJustificativaDto {
  @ApiProperty({ enum: [StatusJustificativa.APROVADA, StatusJustificativa.REPROVADA] })
  @IsEnum([StatusJustificativa.APROVADA, StatusJustificativa.REPROVADA], {
    message: 'Status deve ser "aprovada" ou "reprovada"',
  })
  @IsNotEmpty()
  status: StatusJustificativa.APROVADA | StatusJustificativa.REPROVADA;

  @ApiPropertyOptional({ example: 'Comprovante validado.' })
  @IsOptional()
  @IsString()
  comentario?: string;
}
