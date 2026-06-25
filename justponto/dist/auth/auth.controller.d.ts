import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
