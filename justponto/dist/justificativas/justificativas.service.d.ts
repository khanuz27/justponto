import { IJustificativasRepositorio } from '../data/interfaces/justificativas.repositorio.interface';
import { ITiposOcorrenciaRepositorio } from '../data/interfaces/tipos-ocorrencia.repositorio.interface';
import { IHistoricoRepositorio } from '../data/interfaces/historico.repositorio.interface';
import { INotificacoesRepositorio } from '../data/interfaces/notificacoes.repositorio.interface';
import { IEmailService } from '../data/interfaces/email.service.interface';
import { IUsuariosRepositorio } from '../data/interfaces/usuarios.repositorio.interface';
import { CriarJustificativaDto } from './dto/criar-justificativa.dto';
import { AvaliarJustificativaDto } from './dto/avaliar-justificativa.dto';
import { PerfilUsuario } from '../common/enums/perfil-usuario.enum';
import { Justificativa } from '../common/entities/justificativa.entity';
import { FiltroJustificativas } from '../data/interfaces/justificativas.repositorio.interface';
export declare class JustificativasService {
    private readonly justificativasRepo;
    private readonly tiposRepo;
    private readonly historicoRepo;
    private readonly notificacoesRepo;
    private readonly emailService;
    private readonly usuariosRepo;
    constructor(justificativasRepo: IJustificativasRepositorio, tiposRepo: ITiposOcorrenciaRepositorio, historicoRepo: IHistoricoRepositorio, notificacoesRepo: INotificacoesRepositorio, emailService: IEmailService, usuariosRepo: IUsuariosRepositorio);
    criar(dto: CriarJustificativaDto, colaboradorId: string, temAnexo: boolean): Promise<Justificativa>;
    listarMinhas(colaboradorId: string): Promise<Justificativa[]>;
    listarPendentes(gerenteId: string): Promise<Justificativa[]>;
    listarTodas(filtro: FiltroJustificativas): Promise<Justificativa[]>;
    avaliar(id: string, dto: AvaliarJustificativaDto, avaliador: {
        id: string;
        perfil: PerfilUsuario;
        gerenteId?: string;
    }): Promise<Justificativa>;
    marcarAjusteLancado(id: string): Promise<Justificativa>;
    private notificarGerente;
}
