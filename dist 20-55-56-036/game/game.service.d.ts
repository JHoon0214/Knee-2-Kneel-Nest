import * as dgram from 'dgram';
import { PlayerActionDTO } from './stateDTO/PlayerActionDTO';
export declare class GameService {
    private rooms;
    private udpServer;
    constructor();
    setUdpServer(udpServer: dgram.Socket): void;
    addClientToRoom(roomId: number, clientId: string, address: string, port: number): void;
    removeClientFromRoom(roomId: number, clientId: string): void;
    broadcastToRoom(roomId: number, senderId: string, data: PlayerActionDTO): void;
}
