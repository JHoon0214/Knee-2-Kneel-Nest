import { Test, TestingModule } from '@nestjs/testing';
import { LobbyConnectorService } from './lobby-connector.service';

describe('LobbyConnectorService', () => {
  let service: LobbyConnectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LobbyConnectorService],
    }).compile();

    service = module.get<LobbyConnectorService>(LobbyConnectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
