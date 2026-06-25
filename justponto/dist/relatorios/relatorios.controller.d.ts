import { RelatoriosService } from './relatorios.service';
export declare class RelatoriosController {
    private readonly service;
    constructor(service: RelatoriosService);
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
