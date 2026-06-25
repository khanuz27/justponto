import { PerfilUsuario } from '../enums/perfil-usuario.enum';
export declare class Usuario {
    id: string;
    nome: string;
    email: string;
    senhaHash: string;
    perfil: PerfilUsuario;
    gerenteId?: string;
    departamento?: string;
    ativo: boolean;
    criadoEm: Date;
    atualizadoEm: Date;
}
