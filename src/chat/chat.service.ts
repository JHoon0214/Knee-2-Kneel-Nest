import { Injectable } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class ChatService {
    private chatRooms = new Map<number, Map<string, net.Socket>>();

    addClientToRoom(roomId: number, clientId: string, socket: net.Socket) {
        if (!this.chatRooms.has(roomId)) {
            this.chatRooms.set(roomId, new Map());
        }
        const room = this.chatRooms.get(roomId);
        room.set(clientId, socket);
        console.log(`Client ${clientId} joined chat room ${roomId}`);
    }

    removeClientFromRoom(roomId: number, clientId: string) {
        const room = this.chatRooms.get(roomId);
        if (room) {
            const clientSocket = room.get(clientId);
            if (clientSocket) {
                clientSocket.end();  // TCP 소켓 닫기
                room.delete(clientId);
            }
            if (room.size === 0) {
                this.chatRooms.delete(roomId);  // 방이 비었으면 삭제
            }
        }
        console.log(`Client ${clientId} left chat room ${roomId}`);
    }

    broadcastToRoom(roomId: number, senderId: string, message: string) {
        const room = this.chatRooms.get(roomId);
        if (!room) {
            console.error(`Chat room ${roomId} not found`);
            return;
        }

        room.forEach((socket, clientId) => {
            socket.setNoDelay(true);  // 즉시 전송 설정
            socket.write(message, (err) => {
                if (err) {
                    console.error(`Failed to send message to ${clientId}:`, err);
                } else {
                    console.log(`Message ${message} sent to ${clientId}`);
                }
            });
        });
    }

    getClientsInRoom(roomId: number): Map<string, net.Socket> {
        return this.chatRooms.get(roomId) || new Map();
    }

    handleClientMessage(roomId: number, senderId: string, message: string) {
        console.log(`Message from ${senderId} in room ${roomId}: ${message}`);
        this.broadcastToRoom(roomId, senderId, message);
    }
}
