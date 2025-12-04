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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
const dgram = require("dgram");
const class_transformer_1 = require("class-transformer");
const PlayerActionDTO_1 = require("./stateDTO/PlayerActionDTO");
let GameController = class GameController {
    constructor(gameService) {
        this.gameService = gameService;
        this.udpServer = dgram.createSocket('udp4');
        this.udpServer.bind(3001, '0.0.0.0', () => {
            console.log('UDP server bound to 0.0.0.0:3001');
        });
        this.udpServer.on('listening', () => {
            const address = this.udpServer.address();
            console.log(`UDP server is listening on ${address.address}:${address.port}`);
        });
        this.udpServer.on('message', (msg, rinfo) => {
            console.log("message in");
            const message = msg.toString();
            const clientId = `${rinfo.address}:${rinfo.port}`;
            const befParsedData = (0, class_transformer_1.plainToInstance)(Object, JSON.parse(message));
            if (befParsedData.dataName === "state") {
                const data = (0, class_transformer_1.plainToInstance)(PlayerActionDTO_1.PlayerActionDTO, befParsedData);
                console.log(`Received message from ${rinfo.address}:${rinfo.port}:`);
                console.log(`jump: ${data.jump}, kick: ${data.kick}, sprint: ${data.sprint}`);
                this.gameService.addClientToRoom(data.roomId, clientId, rinfo.address, rinfo.port);
                this.gameService.broadcastToRoom(data.roomId, clientId, data);
            }
        });
        this.gameService.setUdpServer(this.udpServer);
    }
};
exports.GameController = GameController;
exports.GameController = GameController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameController);
//# sourceMappingURL=game.controller.js.map