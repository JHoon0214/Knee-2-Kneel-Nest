import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameController } from './game/udp/game.controller';
import { GameModule } from './game/udp/game.module';
import { LobbyConnectorModule } from './lobby-connector/lobby-connector.module';
import { ChatModule } from './chat/chat.module';
import { TcpModule } from './game/tcp/tcp.module';

@Module({
    imports: [GameModule, LobbyConnectorModule, ChatModule, TcpModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
