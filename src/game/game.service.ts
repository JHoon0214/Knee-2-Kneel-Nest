import { Injectable } from '@nestjs/common';
import * as dgram from 'dgram';
import { PlayerActionDTO } from './dtos/playerActionDTO';
import { RemoveDTO } from './dtos/removeDTO';
import { PlayerDTO } from './dtos/playerDTO';

@Injectable()
export class GameService {
    private rooms = new Map<number, Map<string, PlayerDTO>>();
    private udpServer: dgram.Socket;
    private inactivityTimeout = 3000;

    constructor() {
        setInterval(() => {
            this.checkInactiveClients();
        }, 1000);
    }

    setUdpServer(udpServer: dgram.Socket) {
        this.udpServer = udpServer;
    }
    addClientToRoom(roomId: number, clientId: string, address: string, port: number, playerIndex: number) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Map());
        }
        const room = this.rooms.get(roomId);
        room.set(clientId, { address, port, lastActive: Date.now(), playerIndex });
        console.log(`Client ${clientId} joined room ${roomId}: ${address}:${port}`);
    }

    updateClientActivity(roomId: number, clientId: string) {
        const room = this.rooms.get(roomId);
        if (room && room.has(clientId)) {
            room.get(clientId).lastActive = Date.now();
        }
    }

    removeClientFromRoom(roomId: number, clientId: string) {
        const room = this.rooms.get(roomId);
        const currPlayerIndex = room.get(clientId).playerIndex
        if (room) {
            room.delete(clientId);
            if (room.size === 0) {
                this.rooms.delete(roomId);
            }
        }  
        console.log(`Client ${clientId} left room ${roomId}`);
        this.broadcastRemove(roomId, { dataName: 'remove', playerIndex: currPlayerIndex});
    }

    broadcastRemove(roomId: number, data: RemoveDTO) {
        const room = this.rooms.get(roomId);
        console.log(`broadcast to member in room ${roomId}`);
        if (!room) {
            console.error(`Room ${roomId} not found`);
            return;
        }

        room.forEach((client, clientId) => {
            const message = JSON.stringify(data);
            console.log(`sending... remove to ${client.port} ${client.address}`)
            this.udpServer.send(message, client.port, client.address, (err) => {
                if (err) {
                    console.error(`Error broadcasting to client ${clientId}: ${err}`);
                }
            });
        });
    }

    broadcastState(roomId: number, data: PlayerActionDTO) {
        const room = this.rooms.get(roomId);
        console.log(`broadcast to member in room ${roomId}`);
        if (!room) {
            console.error(`Room ${roomId} not found`);
            return;
        }

        room.forEach((client, clientId) => {
            const message = JSON.stringify(data);
            console.log(`sending... ${message} to ${client.port} ${client.address}`)
            this.udpServer.send(message, client.port, client.address, (err) => {
                if (err) {
                    console.error(`Error broadcasting to client ${clientId}: ${err}`);
                }
            });
        });
    }

    checkInactiveClients() {
        const now = Date.now();
        this.rooms.forEach((room, roomId) => {
            room.forEach((client, clientId) => {
                if (now - client.lastActive > this.inactivityTimeout) {
                    this.removeClientFromRoom(roomId, clientId);
                }
            });
        });
    }

}
