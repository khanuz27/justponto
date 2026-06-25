import { Usuario } from '../../common/entities/usuario.entity';

export interface IUsuariosRepositorio {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  findAll(): Promise<Usuario[]>;
  findByGerenteId(gerenteId: string): Promise<Usuario[]>;
}
