import { BadRequestException, Controller } from '@nestjs/common';
import { GameService } from './game.service';
import * as dgram from 'dgram';
import { plainToClass, plainToInstance } from 'class-transformer';
import { validate, validateSync } from 'class-validator';

import { PlayerActionDTO } from './stateDTO/PlayerActionDTO';
import { debug } from 'console';

@Controller()
export class GameController {
    private udpServer: dgram.Socket;

    constructor(private readonly gameService: GameService) {

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
            
            const befParsedData = plainToInstance(Object, JSON.parse(message)) as { [key: string]: any };

            if(befParsedData.dataName === "state") {
                const data:PlayerActionDTO = plainToInstance(PlayerActionDTO, befParsedData);

                console.log(`Received message from ${rinfo.address}:${rinfo.port}:`);
                console.log(`jump: ${data.jump}, look: ${data.look}, kick: ${data.kick}, sprint: ${data.sprint}`);

                this.gameService.addClientToRoom(data.roomId, clientId, rinfo.address, rinfo.port);
                this.gameService.broadcastToRoom(data.roomId, clientId, data);
            }
        });

        this.gameService.setUdpServer(this.udpServer);
    }
}
