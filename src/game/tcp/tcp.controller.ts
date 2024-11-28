import { Controller, Get } from '@nestjs/common';
import { TcpService } from './tcp.service';

@Controller('tcp')
export class TcpController {
  constructor(private readonly tcpService: TcpService) {}

  @Get('status')
  getStatus() {
    // TCP 서버 상태 확인 로직 추가 가능
    return { status: 'TCP 서버 실행 중', port: 3002 };
  }
}
