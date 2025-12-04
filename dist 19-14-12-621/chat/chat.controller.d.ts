import { OnModuleInit } from '@nestjs/common';
import { ChatService } from './chat.service';
export declare class ChatController implements OnModuleInit {
    private readonly chatService;
    private tcpServer;
    constructor(chatService: ChatService);
    onModuleInit(): void;
}
