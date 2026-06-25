import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { IUsuariosRepositorio } from '../data/interfaces/usuarios.repositorio.interface';
export declare class AuthService {
    private readonly usuariosRepo;
    private readonly jwtService;
    constructor(usuariosRepo: IUsuariosRepositorio, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        access_token: string;
        usuario: {
            id: string;
            nome: string;
            email: string;
            perfil: string;
        };
    }>;
}
