"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosMockRepositorio = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const mock_seed_1 = require("./mock.seed");
let UsuariosMockRepositorio = class UsuariosMockRepositorio {
    constructor() {
        this.usuarios = [...mock_seed_1.USUARIOS_SEED];
    }
    async findById(id) {
        return this.usuarios.find((u) => u.id === id) ?? null;
    }
    async findByEmail(email) {
        return this.usuarios.find((u) => u.email === email) ?? null;
    }
    async findAll() {
        return [...this.usuarios];
    }
    async findByGerenteId(gerenteId) {
        return this.usuarios.filter((u) => u.gerenteId === gerenteId && u.ativo);
    }
    async create(dados) {
        const novo = { ...dados, id: (0, uuid_1.v4)() };
        this.usuarios.push(novo);
        return novo;
    }
    async atualizarAtivo(id, ativo) {
        const usuario = this.usuarios.find((u) => u.id === id);
        if (!usuario)
            return null;
        usuario.ativo = ativo;
        usuario.atualizadoEm = new Date();
        return usuario;
    }
};
exports.UsuariosMockRepositorio = UsuariosMockRepositorio;
exports.UsuariosMockRepositorio = UsuariosMockRepositorio = __decorate([
    (0, common_1.Injectable)()
], UsuariosMockRepositorio);
//# sourceMappingURL=usuarios.mock.repositorio.js.map