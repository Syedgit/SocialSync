import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow iframe embedding if needed
  }));
  
  // Global logging interceptor to sanitize sensitive data
  app.useGlobalInterceptors(new LoggingInterceptor());
  const rawOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173';
  const parsedOrigins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  if (parsedOrigins.length === 0) {
    parsedOrigins.push('http://localhost:5173');
  }
  const allowAllOrigins = parsedOrigins.includes('*');

  // Set global prefix
  app.setGlobalPrefix('api');
  
  // Enable CORS
  app.enableCors({
    origin: allowAllOrigins ? true : parsedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Changed to false to allow unknown properties for now
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3000;
  const enableHttp = (process.env.ENABLE_HTTP ?? 'true').toLowerCase() !== 'false';

  if (enableHttp) {
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  } else {
    await app.init();
    console.log('🛠  Application initialized without HTTP server (worker mode).');
  }
}
bootstrap();

