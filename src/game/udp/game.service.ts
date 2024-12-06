import { Injectable } from '@nestjs/common';
import * as dgram from 'dgram';
import { MoveDTO, PlayerActionDTO } from '../dtos/playerActionDTO';
import { RemoveDTO } from '../dtos/removeDTO';
import { PlayerDTO } from '../dtos/playerDTO';
import { TcpService } from '../tcp/tcp.service';

@Injectable()
export class GameService {
    private rooms = new Map<string, Map<string, PlayerDTO>>();
    private udpServer: dgram.Socket;
    private inactivityTimeout = 3000;
    private cacheCY = new Map<string, Map<string, number>>();

    constructor(private readonly tcpService: TcpService) {
        setInterval(() => {
            this.checkInactiveClients();
        }, 1000);
    }

    setUdpServer(udpServer: dgram.Socket) {
        this.udpServer = udpServer;
    }
    addClientToRoom(gameId: string, clientId: string, address: string, port: number, playerIndex: number, role: number) {
        if (!this.rooms.has(gameId)) {
            this.rooms.set(gameId, new Map());
            this.cacheCY.set(gameId, new Map());
        }
        const room = this.rooms.get(gameId);
        room.set(clientId, { address, port, lastActive: Date.now(), playerIndex, role });
        const cys = this.cacheCY.get(gameId);
        cys.set(clientId, 0.0);
    }

    updateClientActivity(gameId: string, clientId: string) {
        const room = this.rooms.get(gameId);
        if (room && room.has(clientId)) {
            room.get(clientId).lastActive = Date.now();
        }
    }

    removeClientFromRoom(gameId: string, clientId: string) {
        const room = this.rooms.get(gameId);
        const cys = this.cacheCY.get(gameId);
        const currPlayerIndex = room.get(clientId).playerIndex
        
        this.tcpService.removeClientFromRoom(gameId, room.get(clientId).role, room.get(clientId).playerIndex);

        if (room) {
            room.delete(clientId);
            if (room.size === 0) {
                this.rooms.delete(gameId);
            }
        }  
        if(cys) {
            cys.delete(clientId);
            if(cys.size === 0) {
                this.rooms.delete(gameId);
            }
        }
        // console.log(`Client ${clientId} left room ${gameId}`);
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

    broadcastState(gameId: string, data: PlayerActionDTO, clientId: string) {
        const room = this.rooms.get(gameId);
        if(!this.cacheCY.has(gameId) || !this.cacheCY.get(gameId).has(clientId)) {
            console.log(`UDP: 존재하지 않거나 게임에서 삭제된 유저입니다.`);
        }
        const cy = this.cacheCY.get(gameId).get(clientId);
        const isNewState = data.move.x != 0 || data.move.y !=0 || cy-1 > data.cY || cy+1 < data.cY;
        if (!room || !isNewState) {
            return;
        }

        room.forEach((client, clientId) => {
            const message = JSON.stringify(data);
            this.udpServer.send(message, client.port, client.address, (err) => {
                if (err) {
                    console.error(`UDP: Error broadcasting to client ${clientId}: ${err}`);
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
