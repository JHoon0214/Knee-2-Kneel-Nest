const net = require('net');

// TCP 서버와 연결
const client = net.createConnection({ host: '127.0.0.1', port: 3002 }, () => {
  console.log('TCP 서버에 연결되었습니다.');

  // 현재 시간을 ISO 형식으로 생성
  const localDateTime = new Date().toISOString();

  // 서버로 메시지 전송 - 방에 참여
  const joinMessage = JSON.stringify({
    dataName: 'join',
    gameId: 'room1', // 방 ID
    localDateTime: localDateTime, // 현재 시간 추가
  });
  console.log(`보낸 메시지: ${joinMessage}`);
  client.write(joinMessage);

  // 일정 시간 후 브로드캐스트 메시지 전송
  setTimeout(() => {
    const broadcastMessage = JSON.stringify({
      dataName: 'broadcast',
      gameId: 'room1', // 동일한 방 ID 사용
      payload: 'Hello, Room 1!', // 브로드캐스트 메시지 내용
    });
    console.log(`보낸 메시지: ${broadcastMessage}`);
    client.write(broadcastMessage);
  }, 2000);
});

// 서버로부터 메시지 수신
client.on('data', (data) => {
  console.log(`서버 응답: ${data.toString()}`);
});

// 연결 종료 이벤트
client.on('end', () => {
  console.log('TCP 서버와의 연결이 종료되었습니다.');
});

// 에러 처리
client.on('error', (err) => {
  console.error(`에러 발생: ${err.message}`);
});
