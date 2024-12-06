import { Module } from '@nestjs/common';

import { ChatService } from './chat.gateway';
import { SignalingService } from './signaling.gateway';

@Module({
  controllers: [],
  providers: [ChatService, SignalingService]
})
export class ChatModule {}
