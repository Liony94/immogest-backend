import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { swaggerConfig } from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  // Création des dossiers d'upload s'ils n'existent pas
  const uploadDirs = [
    './uploads',
    './uploads/properties',
    './uploads/properties/images',
    './uploads/properties/documents'
  ];

  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configuration globale des pipes de validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Configuration CORS
  app.enableCors();
  
  // Configuration des fichiers statiques
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Configuration Swagger
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Documentation API ImmoGest',
  });

  app.setGlobalPrefix('api');
  await app.listen(3001);
  console.log(`L'application est disponible sur : http://localhost:3001`);
  console.log(`La documentation Swagger est disponible sur : http://localhost:3001/api/docs`);
}
bootstrap();
