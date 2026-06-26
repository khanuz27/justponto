export class JustificativaOcorrencia {
  id: string;
  justificativaId: string;
  tipoOcorrencia: 'entrada' | 'saida_almoco' | 'retorno_almoco' | 'saida' | 'dia_inteiro';
  horarioCorreto?: string; // HH:mm
  criadoEm: Date;
}
