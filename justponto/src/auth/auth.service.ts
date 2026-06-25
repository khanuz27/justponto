import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { IUsuariosRepositorio } from '../data/interfaces/usuarios.repositorio.interface';
import { USUARIOS_REPO } from '../data/data.module';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USUARIOS_REPO)
    private readonly usuariosRepo: IUsuariosRepositorio,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string; usuario: { id: string; nome: string; email: string; perfil: string } }> {
    const usuario = await this.usuariosRepo.findByEmail(dto.email);

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      gerenteId: usuario.gerenteId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    };
  }
}
