# Knee-2-Kneel 게임 서버

## 📖 프로젝트 소개

Knee-2-Kneel은 실시간 멀티플레이어 게임을 위한 NestJS 기반 백엔드 서버입니다. TCP/UDP 프로토콜과 WebSocket을 활용하여 저지연 게임 플레이와 실시간 통신을 지원합니다.

### 인게임 화면
![인게임 플레이 화면](ingame.gif)

## 🎮 주요 기능

### 게임 서버
- **UDP 게임 서버**: 실시간 플레이어 움직임과 액션 처리
- **TCP 게임 서버**: 안정적인 게임 세션 관리 및 상태 동기화
- **플레이어 관리**: 플레이어 입장/퇴장, 팀 배정, 역할 관리
- **게임 상태 브로드캐스팅**: 모든 플레이어에게 실시간 상태 동기화

### 채팅 및 통신
- **WebSocket 채팅 서버**: 실시간 텍스트 채팅 (포트 3004)
- **WebRTC 시그널링 서버**: P2P 음성 채팅을 위한 시그널링 (포트 3005)
- **룸 기반 통신**: 게임 룸별 독립적인 채팅 및 음성 통신

### 로비 연동
- **게임 결과 전송**: 게임 종료 시 로비 서버로 결과 자동 전송
- **플레이어 매칭**: 로비 서버와 연동하여 게임 세션 생성

## 🛠 기술 스택

- **Framework**: NestJS 10.4.8
- **Language**: TypeScript 5.1.3
- **통신 프로토콜**:
  - TCP (포트 3002) - 게임 세션 관리
  - UDP (동적 포트) - 실시간 게임 플레이
  - WebSocket (포트 3004, 3005) - 채팅 및 시그널링
- **HTTP 서버**: Express (포트 3003)
- **주요 라이브러리**:
  - Socket.io - WebSocket 통신
  - ws - WebSocket 구현
  - class-validator - DTO 검증
  - RxJS - 반응형 프로그래밍

## 📁 프로젝트 구조

```
src/
├── app.module.ts          # 메인 애플리케이션 모듈
├── main.ts                # 애플리케이션 엔트리 포인트
├── chat/                  # 채팅 및 시그널링 모듈
│   ├── chat.gateway.ts    # WebSocket 채팅 게이트웨이
│   └── signaling.gateway.ts # WebRTC 시그널링 서버
├── game/                  # 게임 관련 모듈
│   ├── tcp/              # TCP 게임 서버
│   │   └── tcp.service.ts
│   ├── udp/              # UDP 게임 서버
│   │   └── game.service.ts
│   └── dtos/             # 데이터 전송 객체
│       ├── PlayerActionDTO.ts
│       └── PlayerDTO.ts
└── lobby-connector/       # 로비 서버 연동
    └── lobby-connector.service.ts
```

## 🚀 시작하기

### 사전 요구사항
- Node.js 18.0 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 실행

```bash
# 개발 모드 (hot-reload)
npm run start:dev

# 프로덕션 모드
npm run build
npm run start:prod

# 디버그 모드
npm run start:debug
```

### 테스트

```bash
# 유닛 테스트
npm run test

# e2e 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## 🔧 환경 설정

### 포트 설정
- **HTTP API**: 3003
- **TCP 게임 서버**: 3002
- **WebSocket 채팅**: 3004
- **WebRTC 시그널링**: 3005

### CORS 설정
현재 모든 출처에서의 요청을 허용하도록 설정되어 있습니다. 프로덕션 환경에서는 특정 도메인만 허용하도록 수정이 필요합니다.

## 📡 API 엔드포인트

### 게임 서버 프로토콜

#### TCP 메시지 형식
```json
{
  "dataName": "join|jump|kick|sprint|...",
  "gameId": "게임 ID",
  "playerIndex": 0,
  "totalMember": 4,
  "role": 0,
  "localDateTime": "2024-01-01T00:00:00"
}
```

#### UDP 메시지 형식
```json
{
  "dataName": "move|action|remove",
  "playerIndex": 0,
  "move": {"x": 0, "y": 0},
  "cX": 100.0,
  "cY": 200.0
}
```

### WebSocket 채팅
- 연결: `ws://localhost:3004/chat`
- 메시지 송수신: 텍스트 형식

### WebRTC 시그널링
- 연결: `ws://localhost:3005/signal`
- 이벤트 타입: `joinRoom`, `offer`, `answer`, `iceCandidate`

## 🔍 주요 기능 상세

### 플레이어 비활성 체크
- 3초간 활동이 없는 플레이어는 자동으로 게임에서 제거
- 1초마다 비활성 클라이언트 체크 수행

### 게임 세션 관리
- 룸 기반 게임 세션 관리
- 플레이어별 인덱스 및 팀 할당
- 게임 종료 시 로비 서버로 결과 자동 전송

### 상태 동기화
- UDP를 통한 빠른 움직임 데이터 전송
- TCP를 통한 안정적인 게임 이벤트 처리
- 캐싱을 통한 불필요한 상태 전송 방지

## 📝 개발 도구

```bash
# 코드 포맷팅
npm run format

# 린트 검사
npm run lint
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 UNLICENSED입니다.

## 👥 팀

Knee-2-Kneel 개발팀

## 🔗 관련 링크

- 로비 서버: https://knee2kneel.com
- 게임 클라이언트: [클라이언트 저장소 링크]