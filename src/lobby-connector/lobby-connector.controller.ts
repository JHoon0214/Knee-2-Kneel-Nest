import { Controller, Get } from '@nestjs/common';

@Controller()
export class LobbyConnectorController {
    @Get('test')
    getHello(): string {
      console.log("http hello world");
      return 'Hello World!';
    }
}
