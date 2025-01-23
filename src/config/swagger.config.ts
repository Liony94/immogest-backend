import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('ImmoGest API')
  .setDescription('Documentation de l\'API de gestion immobilière ImmoGest')
  .setVersion('1.0')
  .addTag('Propriétés', 'Endpoints de gestion des propriétés')
  .addTag('Accès aux propriétés', 'Endpoints de gestion des accès aux propriétés')
  .addTag('Documents des propriétés', 'Endpoints de gestion des documents des propriétés')
  .addTag('Locataires des propriétés', 'Endpoints de gestion des locataires')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Entrez votre token JWT',
      in: 'header',
    },
    'access-token',
  )
  .build(); 