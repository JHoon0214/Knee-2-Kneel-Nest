import { Module, forwardRef } from '@nestjs/common';
import { TcpController } from './tcp.controller';
import { TcpService } from './tcp.service';
import { LobbyConnectorModule } from 'src/lobby-connector/lobby-connector.module';
import { GameModule } from '../udp/game.module';

@Module({
  imports: [ LobbyConnectorModule, forwardRef(() => GameModule) ],
  controllers: [TcpController],
  providers: [TcpService],
  exports: [TcpService]
})
export class TcpModule {}
