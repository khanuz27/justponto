"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('JustPonto API')
        .setDescription('API de justificativas de não registro de ponto.\n\n' +
        '**Credenciais de teste (senha: senha123):**\n' +
        '- colaborador@empresa.com (colaborador)\n' +
        '- gerente@empresa.com (gerente)\n' +
        '- rh@empresa.com (rh)\n' +
        '- direcao@empresa.com (direção)')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = config.get('PORT', 3000);
    await app.listen(port);
    console.log(`\n🚀 JustPonto API rodando em: http://localhost:${port}`);
    console.log(`📚 Documentação Swagger:     http://localhost:${port}/docs\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map