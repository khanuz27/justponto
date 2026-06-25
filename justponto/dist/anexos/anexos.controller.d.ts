import { AnexosService } from './anexos.service';
export declare class AnexosController {
    private readonly service;
    constructor(service: AnexosService);
    upload(justificativaId: string, arquivo: Express.Multer.File): Promise<import("../common/entities").Anexo>;
    download(id: string): Promise<{
        url: string;
    }>;
    listarPorJustificativa(justificativaId: string): Promise<import("../common/entities").Anexo[]>;
}
