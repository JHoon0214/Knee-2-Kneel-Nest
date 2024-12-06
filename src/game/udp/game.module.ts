import { Module, forwardRef } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TcpController } from '../tcp/tcp.controller';
import { TcpModule } from '../tcp/tcp.module';

@Module({
  imports: [ forwardRef(() => TcpModule) ],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService]
})
export class GameModule {}