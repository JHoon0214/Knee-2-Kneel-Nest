import { Module } from '@nestjs/common';
import { LobbyConnectorController } from './lobby-connector.controller';
import { LobbyConnectorService } from './lobby-connector.service';

@Module({
  controllers: [LobbyConnectorController],
  providers: [LobbyConnectorService]
})
export class LobbyConnectorModule {}
