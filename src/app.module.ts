import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameController } from './game/game.controller';
import { GameModule } from './game/game.module';
import { LobbyConnectorModule } from './lobby-connector/lobby-connector.module';

@Module({
    imports: [GameModule, LobbyConnectorModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
