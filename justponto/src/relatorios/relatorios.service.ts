import { Injectable, Inject } from '@nestjs/common';
import { IJustificativasRepositorio } from '../data/interfaces/justificativas.repositorio.interface';
import { IUsuariosRepositorio } from '../data/interfaces/usuarios.repositorio.interface';
import { ITiposOcorrenciaRepositorio } from '../data/interfaces/tipos-ocorrencia.repositorio.interface';
import { JUSTIFICATIVAS_REPO, USUARIOS_REPO, TIPOS_OCORRENCIA_REPO } from '../data/data.module';
import { StatusJustificativa } from '../common/enums/status-justificativa.enum';
import { Periodo } from '../common/enums/periodo.enum';

@Injectable()
export class RelatoriosService {
  constructor(
    @Inject(JUSTIFICATIVAS_REPO)
    private readonly justificativasRepo: IJustificativasRepositorio,
    @Inject(USUARIOS_REPO)
    private readonly usuariosRepo: IUsuariosRepositorio,
    @Inject(TIPOS_OCORRENCIA_REPO)
    private readonly tiposRepo: ITiposOcorrenciaRepositorio,
  ) {}

  async resumo() {
    const [todas, usuarios, tipos] = await Promise.all([
      this.justificativasRepo.findAll(),
      this.usuariosRepo.findAll(),
      this.tiposRepo.findAll(false),
    ]);

    // 1. Total por status
    const totalPorStatus = {
      pendente: 0,
      aprovada: 0,
      reprovada: 0,
    };
    for (const j of todas) {
      totalPorStatus[j.status]++;
    }

    // 2. Por colaborador
    const porColaborador: Record<string, {
      nome: string;
      total: number;
      pendentes: number;
      aprovadas: number;
      reprovadas: number;
      diasJustificados: number;
      horasJustificadas: number;
    }> = {};

    for (const j of todas) {
      if (!porColaborador[j.colaboradorId]) {
        const usuario = usuarios.find((u) => u.id === j.colaboradorId);
        porColaborador[j.colaboradorId] = {
          nome: usuario?.nome ?? j.colaboradorId,
          total: 0,
          pendentes: 0,
          aprovadas: 0,
          reprovadas: 0,
          diasJustificados: 0,
          horasJustificadas: 0,
        };
      }

      const reg = porColaborador[j.colaboradorId];
      reg.total++;
      if (j.status === StatusJustificativa.PENDENTE) reg.pendentes++;
      if (j.status === StatusJustificativa.APROVADA) reg.aprovadas++;
      if (j.status === StatusJustificativa.REPROVADA) reg.reprovadas++;

      // Calcula dias/horas apenas das aprovadas
      if (j.status === StatusJustificativa.APROVADA) {
        if (j.periodo === Periodo.DIA_INTEIRO) {
          reg.diasJustificados += 1;
          reg.horasJustificadas += 8; // Jornada padrão
        } else if (j.horaInicio && j.horaFim) {
          const [hIni, mIni] = j.horaInicio.split(':').map(Number);
          const [hFim, mFim] = j.horaFim.split(':').map(Number);
          const horas = (hFim * 60 + mFim - (hIni * 60 + mIni)) / 60;
          reg.horasJustificadas += Math.max(0, horas);
          reg.diasJustificados += horas >= 4 ? 0.5 : 0;
        }
      }
    }

    // 3. Ranking de motivos
    const contagemMotivos: Record<string, number> = {};
    for (const j of todas) {
      contagemMotivos[j.tipoOcorrenciaId] = (contagemMotivos[j.tipoOcorrenciaId] ?? 0) + 1;
    }

    const rankingMotivos = Object.entries(contagemMotivos)
      .map(([tipoId, total]) => {
        const tipo = tipos.find((t) => t.id === tipoId);
        return { tipoId, nome: tipo?.nome ?? tipoId, total };
      })
      .sort((a, b) => b.total - a.total);

    return {
      totalGeral: todas.length,
      totalPorStatus,
      porColaborador: Object.values(porColaborador),
      rankingMotivos,
    };
  }
}
