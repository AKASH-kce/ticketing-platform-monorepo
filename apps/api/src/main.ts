import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import 'dotenv/config';
import { EventsService } from './events/events.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const port = process.env.PORT || 3001;

  const eventsService = app.get(EventsService);
  console.log('🔍 EventsService instance:', eventsService);

  try {
    if (!eventsService) {
      console.error('❌ EventsService not found!');
    } else {
      console.log('🟢 Calling findAll...');
      const events = await eventsService.findAll();
      console.log('📦 Events on startup:', events);
    }
  } catch (error) {
    console.error('❌ Error fetching events on startup:', error);
  }

  await app.listen(port);
  console.log(`🚀 API server running on port ${port}`);
}

bootstrap();
