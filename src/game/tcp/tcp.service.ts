import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'net';
import { GameData, gamesData } from '../../lobby-connector/game-data';
import { LobbyConnectorService } from '../../lobby-connector/lobby-connector.service';
import { json } from 'stream/consumers';
import { captureRejectionSymbol } from 'events';

interface RoomData {
  members: Set<Socket>;
  memberIndex: Map<Socket, number>;
  teams : Map<Socket, number>;
  joinComplete: boolean;
  startTimeout?: NodeJS.Timeout;
  totalMembers: number;
  studentNum: number;
  remainStdNum: number;
  stdAliveCheck: number[];
  currJoin: boolean[];
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
        // socket.write('All: dataName이 누락되었습니다.');
        return;
      }

      console.log(`message in: ${message}`);
      console.log(`parsed in: ${parsed.stringify}`);

      // dataName에 따른 처리
      switch (dataName) {
        case 'join': {
          const { gameId, playerIndex, totalMember, localDateTime, studentNum, role } = parsed;
          if (!gameId || playerIndex==null || totalMember<0 || !localDateTime) {
            // socket.write('join 메시지에 필요한 필드가 누락되었습니다.');
            return;
          }
          console.log(`Join: 새로운 유저(${playerIndex})가 게임(${gameId})에 참가하였습니다`);
          // socket.write(`Join: 새로운 유저(${playerIndex})가 게임(${gameId})에 참가하였습니다`);
          this.handleJoin(socket, gameId, playerIndex, totalMember, localDateTime, studentNum, role );
          break;
        }

        case 'jump':
          const { playerIndex } = parsed;
          console.log(`${dataName}: ${playerIndex}`)
        case 'kick':
        case 'sprint':
        case 'broadcast': {
          const { gameId } = parsed;
          console.log(`logging!!: ${dataName} - ${parsed['playerIndex']}`)
          if (!gameId) {
            console.log(`${dataName}:  메시지에 gameId가 누락되었습니다.`)
            // socket.write(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
            return;
          }
          this.broadcastToRoom(gameId, message);
          break;
        }
        case 'kickCollision': {
          this.professorDefeated(parsed, dataName, message);
          break;
        }
        case 'a_kickCollision': {
          this.assistantDefeated(parsed, dataName, message);
          break;
        }
        case 'throwCollision': {
          this.hitAndDown(parsed);
          break;
        }
        case 'throwing': {
          const { gameId } = parsed;
          if (!gameId) {
            console.log(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
            // socket.write(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
            return;
          }
          this.broadcastToRoom(gameId, message);
          break;
        }
        case 'point': {
          const { gameId } = parsed;
          if (!gameId) {
            console.log(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
            // socket.write(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
            return;
          }
          this.broadcastToRoom(gameId, message);
          break;
        }
        case 'pointCollision': {
          const { gameId } = parsed;
          if (!gameId) {
            console.log(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
            // socket.write(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
            return;
          }
          this.broadcastToRoom(gameId, message);
          break;
        }
        case 'chat' : {
          const { gameId, chatMessage } = parsed;
          if (!gameId) {
            console.log(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
            // socket.write(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
            return;
          }
          const team = this.rooms.get(gameId)!.teams.get(socket) == 2 ? 1 : 0;

          const roleNames = ["교수", "조교", "학생"];

          const newChatContent = "player" + this.rooms.get(gameId)!.memberIndex.get(socket) + "(" + roleNames[this.rooms.get(gameId)!.teams.get(socket)] + ")" + " : " + chatMessage;
          const newMessage = JSON.stringify({
            ...parsed,
            chatMessage: newChatContent
          });
          
          this.broadcastToRoomInTeam(gameId, newMessage, team);
          break;
        }
        case 'startTask': {
          const { gameId } = parsed;
          if (!gameId) {
            console.log(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
            // socket.write(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
            return;
          }
          this.broadcastToRoom(gameId, message);
          break;
        }
        case 'endTask': {
          const { gameId } = parsed;
          if (!gameId) {
            console.log(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
            // socket.write(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
            return;
          }
          this.broadcastToRoom(gameId, message);
          break;
        }
        default:
          // socket.write(`알 수 없는 dataName: ${dataName}`);
          break;
      }
    } catch (error) {
      // socket.write(`데이터 처리 중 오류 발생: ${error.message}`);
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

  private handleJoin(socket: Socket, gameId: string, playerIndex: number, totalMember: number, localDateTime: string, studentNum: number, role: number) {
    if (!this.rooms.has(gameId)) {
      // 방 초기화
      this.rooms.set(gameId, {
        members: new Set(),
        teams: new Map(),
        memberIndex: new Map(),
        joinComplete: false,
        totalMembers: totalMember,
        startTimeout: setTimeout(() => {
          this.startGame(socket, gameId, false);
        }, 10000), // 10초 타이머
        studentNum: studentNum,
        remainStdNum: studentNum,
        stdAliveCheck: Array(totalMember).fill(-1),
        currJoin: Array(totalMember).fill(true)
      });
    }
    
    const room = this.rooms.get(gameId)!;

    if (room.joinComplete) {
      console.log(`방 ${gameId}에 이미 게임이 시작되었습니다.`);
      // socket.write(`방 ${gameId}에 이미 게임이 시작되었습니다.`);
      return;
    }

    // 방에 클라이언트 추가
    room.members.add(socket);
    console.log("role: ", role);
    room.teams.set(socket, role);
    room.memberIndex.set(socket, playerIndex);

    // 클라이언트에게 응답
    // socket.write(
    //   JSON.stringify({
    //     message: `방 '${gameId}'에 참여하였습니다.`,
    //     gameId,
    //     playerIndex,
    //     localDateTime,
    //   }),
    // );

    // 모든 클라이언트가 참여했는지 확인
    if (room.members.size === room.totalMembers) {
      clearTimeout(room.startTimeout); // 10초 제한 타이머 해제
      this.startGame(socket, gameId, true);
    }
  }

  private startGame(socket: Socket, gameId: string, success: boolean) {
    const room = this.rooms.get(gameId);
    if (!room) return;

    const serverTime = new Date();

    // 게임 시작 메시지 전송
    const message = JSON.stringify({
      dataName: 'gameStart',
      success,
      serverTime: `${serverTime.getFullYear()}-${String(serverTime.getMonth() + 1).padStart(2, '0')}-${String(serverTime.getDate()).padStart(2, '0')}T${String(serverTime.getHours()).padStart(2, '0')}:${String(serverTime.getMinutes()).padStart(2, '0')}:${String(serverTime.getSeconds()).padStart(2, '0')}`
    });

    for (const member of room.members) {
      member.write(message);
    }

    console.log(`방 ${gameId}에 모든 유저가 접속했습니다. 게임 시작: success=${success}`);
    socket.write(`방 ${gameId}에 모든 유저가 접속했습니다. 게임 시작: success=${success}`);

    // 방 데이터 정리
    room.joinComplete = true;
  }

  private broadcastToRoom(gameId: string, message: string) {
    console.log(`game id is ${gameId}`)
    const room = this.rooms.get(gameId);
    if (!room) {
      console.log(`boadcast: 방 '${gameId}'이 존재하지 않습니다.`);
      // socket.write(`boadcast: 방 '${gameId}'이 존재하지 않습니다.`);
      return;
    }

    for (const client of room.members) {
      client.write(message);
    }
    console.log(`방 '${gameId}'에 메시지가 브로드캐스트되었습니다: ${message}`);
  }

  private broadcastToRoomInTeam(gameId: string, message: string, userTeam: number) {
    console.log(`game id is ${gameId}`)
    const room = this.rooms.get(gameId);
    if (!room) {
      console.log(`boadcast: 방 '${gameId}'이 존재하지 않습니다.`);
      // socket.write(`boadcast: 방 '${gameId}'이 존재하지 않습니다.`);
      return;
    }
    for (const [client, team] of room.teams) {
      const currTeam = team==2 ? 1 : 0;
      if(currTeam==userTeam) {
        console.log(`team ${userTeam}에게 메시지가 브로드캐스트되었습니다: ${message}`);
        client.write(message);
      }
    }
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

  removeClientFromRoom(gameId: string, role: number, playerIndex: number) {
    const room = this.rooms.get(gameId);

    if (!room) {
      console.log(`방 '${gameId}'이 존재하지 않습니다.`);
      return;
    }
    room.currJoin[playerIndex]=false;

    if(role==0) {
      const map: Record<string, any> = { dataName: 'kickCollision', gameId: gameId, whokicked: -1, isOut: true };

      //JSON으로 변환한 뒤 문자열로 변환
      const jsonString = JSON.stringify(map);
      const parse = JSON.parse(jsonString)

      this.professorDefeated(parse, "kickCollision", JSON.stringify(parse));
    }
    else if(role==1) {
      const map: Record<string, any> = { dataName: 'a_kickCollision', gameId: gameId, whokicked: -1, whoHit: playerIndex, isOut: true };

      const jsonString = JSON.stringify(map);
      const parse = JSON.parse(jsonString);

      this.assistantDefeated(parse, "a_kickCollision", JSON.stringify(parse));
    }
    else if(role==2) {
      const map: Record<string, any> = { dataName: 'throwCollision', gameId: gameId, whoHit: playerIndex, isOut: true };

      //JSON으로 변환한 뒤 문자열로 변환
      const jsonString = JSON.stringify(map);
      const parse = JSON.parse(jsonString);

      this.hitAndDown(parse);
    }
  }
  
  hitAndDown(parsed: any) {
    const { gameId, whoHit } = parsed;
    if(!("isOut" in parsed)) {
      parsed.isOut = false;
    }

    console.log(`throwCollision : gameId - ${gameId} whohit - ${whoHit}`)
  
    if (!gameId || whoHit==null) {
      // socket.write('throwCollision 메시지에 필요한 필드 gameId 또는 whoHit가 누락되었습니다.');
      console.log(`throwCollision 메시지에 필요한 필드 gameId 또는 whoHit가 누락되었습니다.`);
      return;
    }
  
    // 방 데이터 가져오기
    const room = this.rooms.get(gameId);
    if (!room) {
      // socket.write(`ThrowCollision: 방 '${gameId}'이 존재하지 않습니다.`);
      console.log(`ThrowCollision: 방 '${gameId}'이 존재하지 않습니다.`);
      return;
    }

    console.log('howhit: ', whoHit);

    if(whoHit>99) {
      console.log("npc hit");
      const isEnd = false;
      const responseMessage = {
        ...parsed,
        isEnd,
      };
      this.broadcastToRoom(gameId, JSON.stringify(responseMessage));
      return;
    }
    
    if(room.stdAliveCheck[whoHit]!=-1) {
      return;
    }

    room.remainStdNum -= 1;
    room.stdAliveCheck[whoHit]=room.remainStdNum;
  
    console.log(`ThrowCollision: 학생 탈락. 남은 학생 수: ${room.remainStdNum}`);
    // socket.write(`ThrowCollision: 학생 탈락. 남은 학생 수: ${room.remainStdNum}`);
  
    // isEnd 값 결정
    const isEnd = room.remainStdNum <= 0;
  
    // 메시지에 isEnd 필드 추가
    const responseMessage = {
      ...parsed,
      isEnd,
    };

    console.log("throw collision send broadcast");
  
    // 브로드캐스트
    this.broadcastToRoom(gameId, JSON.stringify(responseMessage));
  
    // 게임 종료 시 추가 처리
    if (isEnd) {
      console.log(`게임 '${gameId}'의 게임이 종료되었습니다.`);
      // socket.write(`게임 '${gameId}'의 게임이 종료되었습니다`);
      this.lobbyConnectorService.sendGameResultToLobby(gameId, this.rooms.get(gameId).currJoin)
    }
  }

  professorDefeated(parsed: any, dataName: string, message: string) {
    const { gameId } = parsed;
    if(!("isOut" in parsed)) {
      parsed.isOut = false;
    }

    if (!gameId) {
      console.log(`${dataName}:  메시지에 gameId가 누락되었습니다.`)
      // socket.write(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
      return;
    }
    this.broadcastToRoom(gameId, message);
    this.lobbyConnectorService.sendGameResultToLobby(gameId, this.rooms.get(gameId).currJoin);
  }

  assistantDefeated(parsed: any, dataName: string, message: string) {
    const { gameId } = parsed;
    if(!("isOut" in parsed)) {
      parsed.isOut = false;
    }

    if (!gameId) {
      console.log(`${dataName}:  메시지에 gameId가 누락되었습니다.`)
      // socket.write(`${dataName}:  메시지에 gameId가 누락되었습니다.`);
      return;
    }
    this.broadcastToRoom(gameId, message);
  }
}
