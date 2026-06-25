import { IJustificativasRepositorio } from '../data/interfaces/justificativas.repositorio.interface';
import { IUsuariosRepositorio } from '../data/interfaces/usuarios.repositorio.interface';
import { ITiposOcorrenciaRepositorio } from '../data/interfaces/tipos-ocorrencia.repositorio.interface';
export declare class RelatoriosService {
    private readonly justificativasRepo;
    private readonly usuariosRepo;
    private readonly tiposRepo;
    constructor(justificativasRepo: IJustificativasRepositorio, usuariosRepo: IUsuariosRepositorio, tiposRepo: ITiposOcorrenciaRepositorio);
    resumo(): Promise<{
        totalGeral: number;
        totalPorStatus: {
            pendente: number;
            aprovada: number;
            reprovada: number;
        };
        porColaborador: {
            nome: string;
            total: number;
            pendentes: number;
            aprovadas: number;
            reprovadas: number;
            diasJustificados: number;
            horasJustificadas: number;
        }[];
        rankingMotivos: {
            tipoId: string;
            nome: string;
            total: number;
        }[];
    }>;
}
