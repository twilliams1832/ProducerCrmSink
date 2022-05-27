import { Test, TestingModule } from '@nestjs/testing';
import { ProducerDataService } from './producer-data.service';

describe('ProducerDataService', () => {
  let service: ProducerDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProducerDataService],
    }).compile();

    service = module.get<ProducerDataService>(ProducerDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
