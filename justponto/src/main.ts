import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // ── Validação global de DTOs ─────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Remove campos não declarados no DTO
      forbidNonWhitelisted: true,
      transform: true,          // Transforma tipos automaticamente
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // ── Swagger / OpenAPI em /docs ────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('JustPonto API')
    .setDescription(
      'API de justificativas de não registro de ponto.\n\n' +
      '**Credenciais de teste (senha: senha123):**\n' +
      '- colaborador@empresa.com (colaborador)\n' +
      '- gerente@empresa.com (gerente)\n' +
      '- rh@empresa.com (rh)\n' +
      '- direcao@empresa.com (direção)',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`\n🚀 JustPonto API rodando em: http://localhost:${port}`);
  console.log(`📚 Documentação Swagger:     http://localhost:${port}/docs\n`);
}

bootstrap();
