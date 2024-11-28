import { Injectable } from '@nestjs/common';
import * as dgram from 'dgram';
import { PlayerActionDTO } from '../dtos/playerActionDTO';
import { RemoveDTO } from '../dtos/removeDTO';
import { PlayerDTO } from '../dtos/playerDTO';
import { TcpService } from '../tcp/tcp.service';

@Injectable()
export class GameService {
    private rooms = new Map<string, Map<string, PlayerDTO>>();
    private udpServer: dgram.Socket;
    private inactivityTimeout = 3000;

    constructor(private readonly tcpService: TcpService) {
        setInterval(() => {
            this.checkInactiveClients();
        }, 1000);
    }

    setUdpServer(udpServer: dgram.Socket) {
        this.udpServer = udpServer;
    }
    addClientToRoom(gameId: string, clientId: string, address: string, port: number, playerIndex: number) {
        if (!this.rooms.has(gameId)) {
            this.rooms.set(gameId, new Map());
        }
        const room = this.rooms.get(gameId);
        room.set(clientId, { address, port, lastActive: Date.now(), playerIndex });
        // console.log(`Client ${clientId} joined room ${gameId}: ${address}:${port}`);
    }

    updateClientActivity(gameId: string, clientId: string) {
        const room = this.rooms.get(gameId);
        if (room && room.has(clientId)) {
            room.get(clientId).lastActive = Date.now();
        }
    }

    removeClientFromRoom(gameId: string, clientId: string) {
        const room = this.rooms.get(gameId);
        const currPlayerIndex = room.get(clientId).playerIndex
        if (room) {
            room.delete(clientId);
            if (room.size === 0) {
                this.rooms.delete(gameId);
            }
        }  
        // console.log(`Client ${clientId} left room ${gameId}`);
        this.tcpService.removeClientFromRoom(gameId, clientId);
        this.broadcastRemove(gameId, { dataName: 'remove', playerIndex: currPlayerIndex});
    }

    broadcastRemove(gameId: string, data: RemoveDTO) {
        const room = this.rooms.get(gameId);
        // console.log(`broadcast to member in room ${gameId}`);
        if (!room) {
            // console.error(`Room ${gameId} not found`);
            return;
        }

        room.forEach((client, clientId) => {
            const message = JSON.stringify(data);
            // console.log(`sending... remove to ${client.port} ${client.address}`)
            this.udpServer.send(message, client.port, client.address, (err) => {
                if (err) {
                    // console.error(`Error broadcasting to client ${clientId}: ${err}`);
                }
            });
        });
    }

    broadcastState(gameId: string, data: PlayerActionDTO) {
        const room = this.rooms.get(gameId);
        // console.log(`broadcast to member in room ${gameId}`);
        if (!room) {
            // console.error(`Room ${gameId} not found`);
            return;
        }

        room.forEach((client, clientId) => {
            const message = JSON.stringify(data);
            // console.log(`sending... ${message} to ${client.port} ${client.address}`)
            this.udpServer.send(message, client.port, client.address, (err) => {
                if (err) {
                    // console.error(`Error broadcasting to client ${clientId}: ${err}`);
                }
            });
        });
    }

    checkInactiveClients() {
        const now = Date.now();
        this.rooms.forEach((room, gameId) => {
            room.forEach((client, clientId) => {
                if (now - client.lastActive > this.inactivityTimeout) {
                    this.removeClientFromRoom(gameId, clientId);
                }
            });
        });
    }
}
