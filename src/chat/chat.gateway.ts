import { Injectable, OnModuleInit } from '@nestjs/common';
import * as WebSocket from 'ws';

@Injectable()
export class ChatService implements OnModuleInit {
  private wss: WebSocket.Server;

  onModuleInit() {
    this.wss = new WebSocket.Server({ port: 3004, path: '/chat' });

    this.wss.on('connection', (ws) => {
      console.log('New chat client connected');

      ws.on('message', (message) => {
        console.log('Received message:', message.toString());
        ws.send(`Echo from Chat Server: ${message}`);
      });

      ws.on('close', () => {
        console.log('Chat client disconnected');
      });
    });

    console.log('Chat WebSocket server running on ws://localhost:3004/chat');
  }
}
