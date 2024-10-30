import { Controller, OnModuleInit } from '@nestjs/common';
import * as net from 'net';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController implements OnModuleInit {
    private tcpServer: net.Server;

    constructor(
        private readonly chatService: ChatService,
    ) {}

    onModuleInit() {
        this.tcpServer = net.createServer((socket) => {
            const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
            let roomId: number;

            console.log(`New client connected: ${clientId}`);

            socket.on('data', (data) => {
                const message = data.toString().trim(); // 공백 제거
                console.log(`Received data: ${message}`);  // 수신된 데이터를 로그로 출력
            
                if (!message) {
                    console.warn(`Empty message received from client: ${clientId}`);
                    return;
                }
            
                try {
                    const parsedMessage = JSON.parse(message);  // JSON 파싱 시도
                    roomId = parsedMessage.roomId;
                    const messageContent = parsedMessage.message
            
                    // 클라이언트를 채팅 룸에 추가
                    this.chatService.addClientToRoom(roomId, clientId, socket);
            
                    // 메시지를 처리하고 방 전체에 브로드캐스트
                    this.chatService.handleClientMessage(roomId, clientId, messageContent);

                    console.log("send end");
                } catch (err) {
                    console.error(`Failed to parse message: ${message}`, err);  // JSON 파싱 에러 로그
                }
            });
            

            socket.on('end', () => {
                console.log(`Client disconnected: ${clientId}`);
                if (roomId !== undefined) {
                    this.chatService.removeClientFromRoom(roomId, clientId);
                }
            });

            socket.on('error', (err) => {
                console.error(`Client error: ${clientId}`, err);
            });
        });

        this.tcpServer.listen(3002, () => {
            console.log('TCP Chat server listening on port 3002');
        });
    }
}
