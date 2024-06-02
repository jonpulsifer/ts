import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = process.env.PORT ?? "3000";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown
  app.enableShutdownHooks();

  await app.listen(PORT);
}
bootstrap();
