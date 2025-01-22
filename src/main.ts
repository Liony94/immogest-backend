import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
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
  
  // Configuration CORS
  app.enableCors();
  
  // Configuration de la validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
    forbidUnknownValues: false,
  }));

  // Configuration des fichiers statiques
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.setGlobalPrefix('api');
  await app.listen(3001);
}
bootstrap();
