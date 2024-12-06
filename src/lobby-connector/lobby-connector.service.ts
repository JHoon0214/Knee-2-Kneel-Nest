import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { gamesData } from './game-data';

@Injectable()
export class LobbyConnectorService {

  constructor(private readonly httpService: HttpService) {}

  async sendGameResultToLobby(gameId: string): Promise<void> {
    // const game = gamesData.get(gameId);
    // if (!game) {
    //   return;
    // }

    // const payload = {
    //   gameId: game.gameId,
    //   startTime: game.startTime,
    //   players: Array.from(game.players.values()),
    //   winnerTeam: game.winnerTeam,
    //   totalDuration: game.totalDuration,
    // };

    const payload = {
        gameId: '12345678',
        startTime: 'now',
        players: [],
        winnerTeam: 1,
        totalDuration: 2,
      };

    console.log("해치웠나")

    try {

      const response = await firstValueFrom(
        this.httpService.post('https://knee2kneel.com/api/statistics/update', payload),
      );
      gamesData.delete(gameId);
    } catch (error) {
    }
  }
}
