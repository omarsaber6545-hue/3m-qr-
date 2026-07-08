import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as express from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enables rawBody for Stripe Webhooks verification
  });

  const port = process.env.PORT || 5000;

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Turn off CSP stubs for swagger and uploads
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configurations
  app.enableCors({
    origin: '*', // Allow all origins for testing; restrict in production env
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('3M QR Studio API')
    .setDescription('Artistic AI QR Code Generator Backend API Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Validation Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Serve static assets from uploads directory if exists
  app.use('/uploads', express.static('uploads'));

  await app.listen(port);
  logger.log(`======================================================`);
  logger.log(`🚀 3M QR Studio Backend Server running on port ${port}`);
  logger.log(`📚 Swagger documentation available at http://localhost:${port}/docs`);
  logger.log(`======================================================`);
}
bootstrap();
