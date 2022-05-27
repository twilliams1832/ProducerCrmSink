import { Test, TestingModule } from '@nestjs/testing';
import { SqsClientService } from './sqs-client.service';

describe('SqsClientService', () => {
  let service: SqsClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SqsClientService],
    }).compile();

    service = module.get<SqsClientService>(SqsClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
