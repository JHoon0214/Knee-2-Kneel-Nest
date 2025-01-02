"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
let ChatService = class ChatService {
    constructor() {
        this.chatRooms = new Map();
    }
    addClientToRoom(roomId, clientId, socket) {
        if (!this.chatRooms.has(roomId)) {
            this.chatRooms.set(roomId, new Map());
        }
        const room = this.chatRooms.get(roomId);
        room.set(clientId, socket);
        console.log(`Client ${clientId} joined chat room ${roomId}`);
    }
    removeClientFromRoom(roomId, clientId) {
        const room = this.chatRooms.get(roomId);
        if (room) {
            const clientSocket = room.get(clientId);
            if (clientSocket) {
                clientSocket.end();
                room.delete(clientId);
            }
            if (room.size === 0) {
                this.chatRooms.delete(roomId);
            }
        }
        console.log(`Client ${clientId} left chat room ${roomId}`);
    }
    broadcastToRoom(roomId, senderId, message) {
        const room = this.chatRooms.get(roomId);
        if (!room) {
            console.error(`Chat room ${roomId} not found`);
            return;
        }
        room.forEach((socket, clientId) => {
            socket.setNoDelay(true);
            socket.write(message, (err) => {
                if (err) {
                    console.error(`Failed to send message to ${clientId}:`, err);
                }
                else {
                    console.log(`Message ${message} sent to ${clientId}`);
                }
            });
        });
    }
    getClientsInRoom(roomId) {
        return this.chatRooms.get(roomId) || new Map();
    }
    handleClientMessage(roomId, senderId, message) {
        console.log(`Message from ${senderId} in room ${roomId}: ${message}`);
        this.broadcastToRoom(roomId, senderId, message);
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)()
], ChatService);
//# sourceMappingURL=chat.service.js.map