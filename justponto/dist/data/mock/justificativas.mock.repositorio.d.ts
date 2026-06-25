import { IJustificativasRepositorio, FiltroJustificativas } from '../interfaces/justificativas.repositorio.interface';
import { Justificativa } from '../../common/entities/justificativa.entity';
export declare class JustificativasMockRepositorio implements IJustificativasRepositorio {
    private readonly justificativas;
    private readonly colaboradorParaGerente;
    findById(id: string): Promise<Justificativa | null>;
    findByColaboradorId(colaboradorId: string): Promise<Justificativa[]>;
    findPendentesByGerenteId(gerenteId: string): Promise<Justificativa[]>;
    findAll(filtro?: FiltroJustificativas): Promise<Justificativa[]>;
    create(dados: Omit<Justificativa, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<Justificativa>;
    update(id: string, dados: Partial<Justificativa>): Promise<Justificativa | null>;
    marcarAjusteLancado(id: string, lancado: boolean): Promise<Justificativa | null>;
}
