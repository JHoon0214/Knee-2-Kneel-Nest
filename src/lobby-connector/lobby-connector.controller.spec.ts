import { Test, TestingModule } from '@nestjs/testing';
import { LobbyConnectorController } from './lobby-connector.controller';

describe('LobbyConnectorController', () => {
  let controller: LobbyConnectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LobbyConnectorController],
    }).compile();

    controller = module.get<LobbyConnectorController>(LobbyConnectorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
