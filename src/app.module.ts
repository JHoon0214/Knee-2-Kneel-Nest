import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameController } from './game/game.controller';
import { GameModule } from './game/game.module';
import { LobbyConnectorModule } from './lobby-connector/lobby-connector.module';
import { ChatModule } from './chat/chat.module';

@Module({
    imports: [GameModule, LobbyConnectorModule, ChatModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
