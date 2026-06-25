import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RelatoriosService } from './relatorios.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PerfilUsuario } from '../common/enums/perfil-usuario.enum';

@ApiTags('relatorios')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}

  @Get('resumo')
  @Roles(PerfilUsuario.DIRECAO)
  @ApiOperation({ summary: 'Resumo analítico completo (somente Direção)' })
  resumo() {
    return this.service.resumo();
  }
}
