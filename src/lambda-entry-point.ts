import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import { ReplayRequest } from 'nest-enterprise-event-bus-client';
import { KinesisStreamEvent, KinesisStreamRecord } from 'aws-lambda';
//import { ReplayRequestService } from './replay-request/replay-request.service';
import { KinesisReaderService } from './kinesis-reader/kinesis-reader.service';

let appContext: INestApplicationContext;

export const handler = async (event: any, context: any): Promise<any> => {
  if (isKinesisEvent(event)) {
    await handleKinesisStreamEvent(event);
  } else {
    throw new Error(`Cannot process this event type! ${JSON.parse(event)}`);
  }
};

// function isReplayEvent(event: any): event is ReplayRequest {
//   return !!event.componentSource;
// }

function isKinesisEvent(event: any): event is KinesisStreamEvent {
  return event.Records?.some((x: KinesisStreamRecord) => !!x.kinesis);
}

// async function sendReplayRequest(event: ReplayRequest) {
//   if (!appContext) {
//     appContext = await bootstrapContext();
//   }
//   const replayRequestService =
//     getService<ReplayRequestService>(ReplayRequestService);
//   await replayRequestService.requestReplay(event);
// }

async function handleKinesisStreamEvent(event: KinesisStreamEvent) {
  if (!appContext) {
    appContext = await bootstrapContext();
  }
  const kinesisReaderService =
    getService<KinesisReaderService>(KinesisReaderService);
  await kinesisReaderService.handleKinesisEvent(event);
}

function getService<T>(typeOrToken: any) {
  try {
    return appContext.get<T>(typeOrToken);
  } catch (ex) {
    // tslint:disable-next-line: no-console
    console.log(
      `Could not get dependency from context: ${typeOrToken.constructor.name} `,
    );
  }
}

async function bootstrapContext(): Promise<INestApplicationContext> {
  return await NestFactory.createApplicationContext(AppModule);
}
