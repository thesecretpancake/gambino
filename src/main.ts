import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // createApplicationContext starts no HTTP server — correct for a cron-only bot
  await NestFactory.createApplicationContext(AppModule);
  // eslint-disable-next-line no-console
  console.log('--- PERMIT SNIPER ONLINE ---');
}
// eslint-disable-next-line no-console
bootstrap().catch(console.error);
