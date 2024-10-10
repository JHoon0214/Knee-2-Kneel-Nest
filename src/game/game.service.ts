import { Injectable } from '@nestjs/common';
import * as dgram from 'dgram';
import { PlayerActionDTO } from './stateDTO/PlayerActionDTO';

@Injectable()
export class GameService {
    private rooms = new Map<number, Map<string, { address: string, port: number }>>();
    private udpServer: dgram.Socket;

    constructor() {}

    setUdpServer(udpServer: dgram.Socket) {
        this.udpServer = udpServer;
    }
    addClientToRoom(roomId: number, clientId: string, address: string, port: number) {
        port = 3008;
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Map());
        }
        const room = this.rooms.get(roomId);
        room.set(clientId, { address, port });
        console.log(`Client ${clientId} joined room ${roomId}: ${address}:${port}`);
    }

    removeClientFromRoom(roomId: number, clientId: string) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.delete(clientId);
            if (room.size === 0) {
                this.rooms.delete(roomId);  // 방이 비었으면 삭제
            }
        }
        console.log(`Client ${clientId} left room ${roomId}`);
    }

    broadcastToRoom(roomId: number, senderId: string, data: PlayerActionDTO) {
        const room = this.rooms.get(roomId);
        console.log(`broadcast to member in room ${roomId}`);
        if (!room) {
            console.error(`Room ${roomId} not found`);
            return;
        }

        room.forEach((client, clientId) => {
            const message = JSON.stringify(data);
            console.log(`sending... ${message} to ${3008} ${client.address}`)
            this.udpServer.send(message, 3008, client.address, (err) => {
                if (err) {
                    console.error(`Error broadcasting to client ${clientId}: ${err}`);
                }
            });
        });
    }

}
