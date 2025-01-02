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
    const uri = "https://knee2kneel.com/api/game/finish/" + gameId;

    console.log("Sending game result to lobby");
    console.log("Sending game id: " + gameId);
    console.log("Payload: " + JSON.stringify(payload));
    try {
      const response = await firstValueFrom(
        this.httpService.post(uri, payload),
      );
    } catch (error) {
    }
  }
}
