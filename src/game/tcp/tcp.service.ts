import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'net';
import { GameData, gamesData } from '../../lobby-connector/game-data';
import { LobbyConnectorService } from '../../lobby-connector/lobby-connector.service';

interface RoomData {
  members: Set<Socket>;
  joinComplete: boolean;
  startTimeout?: NodeJS.Timeout;
  totalMembers: number;
  studentNum: number;
  remainStdNum: number;
}

@Injectable()
export class TcpService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly lobbyConnectorService: LobbyConnectorService) {}
  private server: Server;
  private rooms: Map<string, RoomData> = new Map();

  onModuleInit() {
    this.server = new Server((socket) => {
      socket.on('data', (data) => this.handleIncomingData(socket, data));
      socket.on('end', () => this.handleSocketEnd(socket));
      socket.on('error', (err) => this.handleSocketError(socket, err));
    });

    this.server.listen(3002, '0.0.0.0', () => {
      console.log('TCP 서버가 3002번 포트에서 실행 중입니다.');
    });
  }

  onModuleDestroy() {
    if (this.server) {
      this.server.close(() => {
        console.log('TCP 서버가 종료되었습니다.');
      });
    }
  }

  private handleIncomingData(socket: Socket, data: Buffer) {
    const message = data.toString();
    try {
      const parsed = JSON.parse(message);

      // dataName 필드 확인
      const { dataName } = parsed;
      if (!dataName) {
        socket.write('dataName이 누락되었습니다.');
        return;
      }

      // dataName에 따른 처리
      switch (dataName) {
        case 'join': {
          console.log(`join input data: ${JSON.stringify(parsed, null, 2)}`);
          const { gameId, playerIndex, totalMember, localDateTime, studentNum } = parsed;
          if (!gameId || playerIndex==null || totalMember<0 || !localDateTime) {
            socket.write('join 메시지에 필요한 필드가 누락되었습니다.');
            return;
          }
          this.handleJoin(socket, gameId, playerIndex, totalMember, localDateTime, studentNum );
          break;
        }

        case 'kick':
        case 'jump':
        case 'sprint':
        case 'broadcast': {
          const { gameId } = parsed;
          console.log(parsed)
          if (!gameId) {
            socket.write(`${dataName} 메시지에 gameId가 누락되었습니다.`);
            return;
          }
          this.broadcastToRoom(gameId, message);
          break;
        }
        case 'kickCollision': {
          const { gameId, payload } = parsed;
          if (!gameId || !payload) {
            socket.write('kickCollision 메시지에 필요한 필드가 누락되었습니다.');
            return;
          }
          this.broadcastToRoom(gameId, message);
          break;
        }
        case 'throwCollision': {
          const { gameId, payload } = parsed;
          if (!gameId || !payload) {
            socket.write('throwCollision 메시지에 필요한 필드가 누락되었습니다.');
            return;
          }
          this.broadcastToRoom(gameId, message);
          break;
        }

        default:
          socket.write(`알 수 없는 dataName: ${dataName}`);
          break;
      }
    } catch (error) {
      socket.write(`데이터 처리 중 오류 발생: ${error.message}`);
    }
  }

  private handleSocketEnd(socket: Socket) {
    console.log('클라이언트 연결 종료.');
    this.removeFromAllRooms(socket);
  }

  private handleSocketError(socket: Socket, error: Error) {
    console.error(`소켓 에러: ${error.message}`);
    this.removeFromAllRooms(socket);
  }

  private handleJoin(socket: Socket, gameId: string, playerIndex: string, totalMember: number, localDateTime: string, studentNum: number) {
    if (!this.rooms.has(gameId)) {
      // 방 초기화
      this.rooms.set(gameId, {
        members: new Set(),
        joinComplete: false,
        totalMembers: totalMember,
        startTimeout: setTimeout(() => {
          this.startGame(gameId, false);
        }, 10000), // 10초 타이머
        studentNum: studentNum,
        remainStdNum: studentNum
      });
      console.log(`input game id is ${gameId}`);
      console.log('${gameId} 보내짐')
    }
    
    const room = this.rooms.get(gameId)!;
    console.log(`room data is ${room}`);

    if (room.joinComplete) {
      socket.write(`방 ${gameId}에 이미 게임이 시작되었습니다.`);
      return;
    }

    // 방에 클라이언트 추가
    room.members.add(socket);

    console.log(`플레이어 ${playerIndex}가 방 '${gameId}'에 추가되었습니다.`);

    // 클라이언트에게 응답
    socket.write(
      JSON.stringify({
        message: `방 '${gameId}'에 참여하였습니다.`,
        gameId,
        playerIndex,
        localDateTime,
      }),
    );

    // 모든 클라이언트가 참여했는지 확인
    if (room.members.size === room.totalMembers) {
      clearTimeout(room.startTimeout); // 10초 제한 타이머 해제
      this.startGame(gameId, true);
    }
  }

  private startGame(gameId: string, success: boolean) {
    const room = this.rooms.get(gameId);
    if (!room) return;

    const serverTime = new Date();

    // 게임 시작 메시지 전송
    const message = JSON.stringify({
      dataName: 'gameStart',
      success,
      serverTime: `${serverTime.getFullYear()}-${String(serverTime.getMonth() + 1).padStart(2, '0')}-${String(serverTime.getDate()).padStart(2, '0')}T${String(serverTime.getHours()).padStart(2, '0')}:${String(serverTime.getMinutes()).padStart(2, '0')}:${String(serverTime.getSeconds()).padStart(2, '0')}:0000000`
    });

    for (const member of room.members) {
      member.write(message);
    }

    console.log(`방 ${gameId} 게임 시작: success=${success}`);

    // 방 데이터 정리
    room.joinComplete = true;
  }

  private broadcastToRoom(gameId: string, message: string) {
    console.log(`game id is ${gameId}`)
    const room = this.rooms.get(gameId);
    if (!room) {
      console.log(`방 '${gameId}'이 존재하지 않습니다.`);
      return;
    }

    for (const client of room.members) {
      client.write(message);
    }
    console.log(`방 '${gameId}'에 메시지가 브로드캐스트되었습니다: ${message}`);
  }

  private removeFromAllRooms(socket: Socket) {
    for (const [gameId, room] of this.rooms.entries()) {
      if (room.members.has(socket)) {
        room.members.delete(socket);
        console.log(`소켓이 방 ${gameId}에서 제거되었습니다.`);

        // 방이 비었으면 삭제
        if (room.members.size === 0) {
          clearTimeout(room.startTimeout);
          this.rooms.delete(gameId);
          console.log(`방 ${gameId}이 삭제되었습니다.`);
        }
        break;
      }
    }
  }

  removeClientFromRoom(gameId: string, clientId: string) {
    const room = this.rooms.get(gameId);
    if (!room) {
      console.log(`방 '${gameId}'이 존재하지 않습니다.`);
      return;
    }
  
    // `clientId`에 해당하는 소켓 찾기
    const socket = Array.from(room.members).find((s) => s['clientId'] === clientId);
    if (socket) {
      room.members.delete(socket); // 소켓 삭제
      console.log(`클라이언트 '${clientId}'가 방 '${gameId}'에서 제거되었습니다.`);
  
      // 방이 비었으면 방 삭제
      if (room.members.size === 0) {
        clearTimeout(room.startTimeout); // 타이머 정리
        this.rooms.delete(gameId);
        console.log(`방 '${gameId}'이 삭제되었습니다.`);
      }
    } else {
      console.log(`클라이언트 '${clientId}'를 방 '${gameId}'에서 찾을 수 없습니다.`);
    }
  }  
}
