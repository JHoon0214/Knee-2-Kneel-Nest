import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as dgram from 'dgram';

async function bootstrap() {
    // HTTP: 3000
    const httpApp = await NestFactory.create(AppModule);
    await httpApp.listen(3003);
    console.log('HTTP server is listening on port 3003');

    // // UDP: 3001
    // const udpServer = dgram.createSocket('udp4');
    // udpServer.bind(3001, '127.0.0.1');

    // udpServer.on('listening', () => {
    //     const address = udpServer.address();
    //     console.log(`UDP server is listening on ${address.address}:${address.port}`);
    // });

    

    // TCP: 3002
    const tcpApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.TCP,
        options: {
            host: '127.0.0.1',
            port: 3002,
        },
    });
    await tcpApp.listen();
    console.log('TCP server is listening on port 3002');
}

bootstrap();
