"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const net = require("net");
const chat_service_1 = require("./chat.service");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    onModuleInit() {
        this.tcpServer = net.createServer((socket) => {
            const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
            let roomId;
            console.log(`New client connected: ${clientId}`);
            socket.on('data', (data) => {
                const message = data.toString().trim();
                console.log(`Received data: ${message}`);
                if (!message) {
                    console.warn(`Empty message received from client: ${clientId}`);
                    return;
                }
                try {
                    const parsedMessage = JSON.parse(message);
                    roomId = parsedMessage.roomId;
                    const messageContent = parsedMessage.message;
                    this.chatService.addClientToRoom(roomId, clientId, socket);
                    this.chatService.handleClientMessage(roomId, clientId, messageContent);
                    console.log("send end");
                }
                catch (err) {
                    console.error(`Failed to parse message: ${message}`, err);
                }
            });
            socket.on('end', () => {
                console.log(`Client disconnected: ${clientId}`);
                if (roomId !== undefined) {
                    this.chatService.removeClientFromRoom(roomId, clientId);
                }
            });
            socket.on('error', (err) => {
                console.error(`Client error: ${clientId}`, err);
            });
        });
        this.tcpServer.listen(3002, () => {
            console.log('TCP Chat server listening on port 3002');
        });
    }
};
exports.ChatController = ChatController;
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map