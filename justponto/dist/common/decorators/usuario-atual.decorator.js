"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioAtual = void 0;
const common_1 = require("@nestjs/common");
exports.UsuarioAtual = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
//# sourceMappingURL=usuario-atual.decorator.js.map