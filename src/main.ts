import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {

    const httpApp = await NestFactory.create(AppModule);
    httpApp.enableCors({
        origin: '*', // 모든 출처 허용
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      });

    await httpApp.listen(3003);
    console.log('HTTP server is listening on port 3003');    
}

bootstrap();
