import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LobbyConnectorController } from './lobby-connector.controller';
import { LobbyConnectorService } from './lobby-connector.service';

@Module({
  imports: [HttpModule],
  controllers: [LobbyConnectorController],
  providers: [LobbyConnectorService],
  exports: [LobbyConnectorService]
})
export class LobbyConnectorModule {}
