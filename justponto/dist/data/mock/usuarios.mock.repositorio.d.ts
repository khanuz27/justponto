import { IUsuariosRepositorio } from '../interfaces/usuarios.repositorio.interface';
import { Usuario } from '../../common/entities/usuario.entity';
export declare class UsuariosMockRepositorio implements IUsuariosRepositorio {
    private readonly usuarios;
    findById(id: string): Promise<Usuario | null>;
    findByEmail(email: string): Promise<Usuario | null>;
    findAll(): Promise<Usuario[]>;
    findByGerenteId(gerenteId: string): Promise<Usuario[]>;
    create(dados: Omit<Usuario, 'id'>): Promise<Usuario>;
    atualizarAtivo(id: string, ativo: boolean): Promise<Usuario | null>;
}
