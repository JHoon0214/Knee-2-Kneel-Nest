import * as net from 'net';
export declare class ChatService {
    private chatRooms;
    addClientToRoom(roomId: number, clientId: string, socket: net.Socket): void;
    removeClientFromRoom(roomId: number, clientId: string): void;
    broadcastToRoom(roomId: number, senderId: string, message: string): void;
    getClientsInRoom(roomId: number): Map<string, net.Socket>;
    handleClientMessage(roomId: number, senderId: string, message: string): void;
}
