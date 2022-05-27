import { Test, TestingModule } from '@nestjs/testing';
import { KinesisReaderService } from './kinesis-reader.service';

describe('KinesisReaderService', () => {
  let service: KinesisReaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KinesisReaderService],
    }).compile();

    service = module.get<KinesisReaderService>(KinesisReaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
