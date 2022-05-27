import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KinesisReaderService } from './kinesis-reader/kinesis-reader.service';
import { ProducerDataService } from './producer-data/producer-data.service';
import { SqsClientService } from './sqs-client/sqs-client.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true
    })
  ],
  controllers: [AppController],
  providers: [AppService, KinesisReaderService, ProducerDataService, SqsClientService],
})
export class AppModule {}
