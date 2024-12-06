import { BadRequestException, Controller } from '@nestjs/common';
import { GameService } from './game.service';
import * as dgram from 'dgram';
import { plainToClass, plainToInstance } from 'class-transformer';
import { validate, validateSync } from 'class-validator';

import { PlayerActionDTO } from '../dtos/playerActionDTO';
import { debug } from 'console';

@Controller()
export class GameController {
    private udpServer: dgram.Socket;

    constructor(private readonly gameService: GameService) {

        this.udpServer = dgram.createSocket('udp4');

        this.udpServer.bind(3001, '0.0.0.0', () => {
            // console.log('UDP server bound to 0.0.0.0:3001');
        });
        
        this.udpServer.on('listening', () => {
            const address = this.udpServer.address();
            console.log(`UDP server is listening on ${address.address}:${address.port}`);
        });

        this.udpServer.on('message', (msg, rinfo) => {
            const message = msg.toString();
            const clientId = `${rinfo.address}:${rinfo.port}`;
            
            const befParsedData = plainToInstance(Object, JSON.parse(message)) as { [key: string]: any };

            if(befParsedData.dataName === "state") {
                const data:PlayerActionDTO = plainToInstance(PlayerActionDTO, befParsedData) ;

                this.gameService.updateClientActivity(data.gameId, clientId);
                this.gameService.addClientToRoom(data.gameId, clientId, rinfo.address, rinfo.port, data.playerIndex, data.role);
                this.gameService.broadcastState(data.gameId, data, clientId);
            }
        });

        this.gameService.setUdpServer(this.udpServer);
    }
}
