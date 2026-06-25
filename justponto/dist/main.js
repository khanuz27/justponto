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
    const frontendUrl = config.get('FRONTEND_URL', '');
    const origensPermitidas = [
        'http://localhost:3001',
        'http://localhost:3000',
        /^https:\/\/.*\.vercel\.app$/,
        ...(frontendUrl ? [frontendUrl] : []),
    ];
    app.enableCors({
        origin: origensPermitidas,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
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
    console.log(`\nJustPonto API rodando em: http://localhost:${port}`);
    console.log(`Documentacao Swagger:     http://localhost:${port}/docs\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map