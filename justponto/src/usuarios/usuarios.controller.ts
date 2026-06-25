import {
  Controller, Get, Post, Patch, Body, Param,
  UseGuards, ConflictException, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUsuariosRepositorio } from '../data/interfaces/usuarios.repositorio.interface';
import { USUARIOS_REPO } from '../data/data.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PerfilUsuario } from '../common/enums/perfil-usuario.enum';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(
    @Inject(USUARIOS_REPO)
    private readonly usuariosRepo: IUsuariosRepositorio,
  ) {}

  @Get()
  @Roles(PerfilUsuario.GERENTE, PerfilUsuario.RH, PerfilUsuario.DIRECAO)
  @ApiOperation({ summary: 'Lista todos os usuários ativos (sem hash de senha)' })
  async findAll() {
    const usuarios = await this.usuariosRepo.findAll();
    return usuarios.map(({ senhaHash: _, ...u }) => u);
  }

  @Post()
  @Roles(PerfilUsuario.GERENTE, PerfilUsuario.RH, PerfilUsuario.DIRECAO)
  @ApiOperation({ summary: 'Cria um novo usuário/funcionário' })
  async criar(@Body() dto: CriarUsuarioDto) {
    // Verifica se e-mail já está em uso
    const existente = await this.usuariosRepo.findByEmail(dto.email);
    if (existente) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const novo = await this.usuariosRepo.create({
      nome: dto.nome,
      email: dto.email,
      senhaHash,
      perfil: dto.perfil,
      ativo: true,
      gerenteId: undefined,
      departamento: undefined,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });

    const { senhaHash: _, ...resultado } = novo;
    return resultado;
  }

  @Patch(':id/status')
  @Roles(PerfilUsuario.GERENTE, PerfilUsuario.RH, PerfilUsuario.DIRECAO)
  @ApiOperation({ summary: 'Ativa ou desativa um funcionário' })
  async atualizarStatus(
    @Param('id') id: string,
    @Body() body: { ativo: boolean },
  ) {
    const atualizado = await this.usuariosRepo.atualizarAtivo(id, body.ativo);
    if (!atualizado) throw new NotFoundException('Usuário não encontrado.');
    const { senhaHash: _, ...resultado } = atualizado;
    return resultado;
  }
}
