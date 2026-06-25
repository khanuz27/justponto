import { IAnexosRepositorio } from '../interfaces/anexos.repositorio.interface';
import { Anexo } from '../../common/entities/anexo.entity';
export declare class AnexosMockRepositorio implements IAnexosRepositorio {
    private readonly anexos;
    findById(id: string): Promise<Anexo | null>;
    findByJustificativaId(justificativaId: string): Promise<Anexo[]>;
    create(dados: Omit<Anexo, 'id' | 'criadoEm'>): Promise<Anexo>;
    remove(id: string): Promise<boolean>;
}
