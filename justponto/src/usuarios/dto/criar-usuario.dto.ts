import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PerfilUsuario } from '../../common/enums/perfil-usuario.enum';

export class CriarUsuarioDto {
  @ApiProperty({ example: 'Maria Souza' })
  @IsString()
  nome: string;

  @ApiProperty({ example: 'maria@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SenhaSegura123', minLength: 6 })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiProperty({ enum: PerfilUsuario })
  @IsEnum(PerfilUsuario)
  perfil: PerfilUsuario;
}
