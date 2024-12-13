type PlayerData = {
    playerId: string;
    missionsCompleted: number;
    decisiveStrike: boolean;
  };
  
  type GameData = {
    gameId: string;
    startTime: Date;
    players: Map<string, PlayerData>;
    winnerTeam: string | null;
    totalDuration: number | null;
  };
  
  const gamesData = new Map<string, GameData>();
  
  export { gamesData, GameData, PlayerData };
  