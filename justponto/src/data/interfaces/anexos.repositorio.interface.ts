import { Anexo } from '../../common/entities/anexo.entity';

export interface IAnexosRepositorio {
  findById(id: string): Promise<Anexo | null>;
  findByJustificativaId(justificativaId: string): Promise<Anexo[]>;
  create(dados: Omit<Anexo, 'id' | 'criadoEm'>): Promise<Anexo>;
  remove(id: string): Promise<boolean>;
}
