import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'colaborador@empresa.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  senha: string;
}
