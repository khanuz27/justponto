import { PerfilUsuario } from '../enums/perfil-usuario.enum';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: PerfilUsuario[]) => import("@nestjs/common").CustomDecorator<string>;
