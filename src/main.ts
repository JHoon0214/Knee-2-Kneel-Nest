import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as dgram from 'dgram';

async function bootstrap() {
    // HTTP: 3000
    const httpApp = await NestFactory.create(AppModule);
    await httpApp.listen(3003);
    console.log('HTTP server is listening on port 3003');
}

bootstrap();
