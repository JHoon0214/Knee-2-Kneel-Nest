import { Injectable, OnModuleInit } from '@nestjs/common';
import * as WebSocket from 'ws';

interface SignalingMessage {
  eventType: string;
  data: any;
}

@Injectable()
export class SignalingService implements OnModuleInit {
  private wss: WebSocket.Server;
  private rooms: Map<string, Set<WebSocket>> = new Map();

  onModuleInit() {
    this.wss = new WebSocket.Server({ port: 3005, path: '/signal' });

    this.wss.on('connection', (ws) => {
      console.log('New client connected');

      ws.on('message', (message) => {
        try {
          const msg: SignalingMessage = JSON.parse(message.toString());
          this.handleMessage(ws, msg);
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        this.handleDisconnect(ws);
      });
    });

    console.log('Signaling WebSocket server running on ws://localhost:3005/signal');
  }

  private handleMessage(ws: WebSocket, msg: SignalingMessage) {
    console.log("input msg " + msg.eventType);
    switch (msg.eventType) {
      case 'joinRoom':
        console.log("new joined");
        this.handleJoinRoom(ws, msg.data);
        break;
      case 'offer':
      case 'answer':
      case 'iceCandidate':
        this.handleRelaySignal(ws, msg);
        break;
      default:
        console.error('Unknown eventType:', msg.eventType);
    }
  }

  private handleJoinRoom(ws: WebSocket, room: string) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room).add(ws);
    ws.send(JSON.stringify({ eventType: 'joinedRoom', room }));
    console.log(`Client joined room: ${room}`);
  }

  private handleRelaySignal(ws: WebSocket, msg: SignalingMessage) {
    // 현재 클라이언트가 속한 방 찾기
    for (const [room, clients] of this.rooms.entries()) {
      if (clients.has(ws)) {
        // 같은 방의 다른 클라이언트에게 시그널링 데이터 전송
        clients.forEach(client => {
          if (client !== ws) {
            client.send(JSON.stringify(msg));
          }
        });
        return;
      }
    }
    console.error('Client not in any room. Ignoring signal:', msg);
  }

  private handleDisconnect(ws: WebSocket) {
    // 클라이언트를 모든 방에서 제거
    this.rooms.forEach((clients, room) => {
      clients.delete(ws);
      if (clients.size === 0) {
        this.rooms.delete(room);
      }
    });
    console.log('Client removed from all rooms');
  }
}
