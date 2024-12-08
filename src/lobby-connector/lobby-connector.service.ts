import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LobbyConnectorService {

  constructor(private readonly httpService: HttpService) {}

  async sendGameResultToLobby(gameId: string, currJoin: boolean[]): Promise<void> {
    const payload = {
      playerIdList: currJoin
      .map((joined, index) => (joined ? index : -1))
      .filter((index) => index !==-1)
    };
    const uri = "http://knee2kneel.com/api/game/finish/" + gameId;

    try {

      const response = await firstValueFrom(
        this.httpService.post(uri, payload),
      );
    } catch (error) {
    }
  }
}
