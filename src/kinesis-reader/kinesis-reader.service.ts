//import { S3RepositoryService } from '@lumeris/nest-s3-manager';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KinesisStreamEvent, KinesisStreamRecord } from 'aws-lambda';
import { Constants } from 'src/constants';
import { ProducerDataService } from 'src/producer-data/producer-data.service';
import { StringDecoder } from 'string_decoder';

@Injectable()
export class KinesisReaderService {
  private readonly logger: Logger;
  private bucket = ``;

  private replayTokens: any[] = [];

  constructor(
    private producerDataService: ProducerDataService,
    //private readonly s3RepositoryService: S3RepositoryService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger(KinesisReaderService.name);
  }

  recordDecoder = (record: KinesisStreamRecord) => {
    const stringDecoder = new StringDecoder('utf8');
    const json = stringDecoder.write(
      Buffer.from(record.kinesis.data, 'base64'),
    );
    return JSON.parse(json);
  };

  filterEventBusEvents = (events, eventFilter) => {
    if (!events || !eventFilter) {
      return events;
    }

    const eventTypes = eventFilter.split(',');
    const filteredRecords = [];

    const ignore = this.configService.get('IGNORE_STREAM_MESSAGES');
    if(ignore === 'true'){
      return filteredRecords;
    }
    
    let event;
    for (event of events) {
      try {
        if (!event.payload || !event.context) {
          this.logger.debug(
            'Skipping event data without payload or context. Decoded Data: ',
            event,
          );
          continue;
        }
        if (!eventFilter || eventTypes.includes(event.context.event)) {
          filteredRecords.push(event);
        }
      } catch (err) {
        this.logger.debug(`Exception decoding the records. Error: `, err.stack);
      }
    }
    return filteredRecords;
  };

  async handleKinesisEvent(event: KinesisStreamEvent) {
    const rawRecords = event.Records.map((x) => this.recordDecoder(x));
    const records = this.filterEventBusEvents(
      rawRecords,
      this.configService.get(`EEB_EVENT_FILTER`),
    );

    this.logger.log(
      `filtered record count: ${records?.length || 0}, total record Count: ${
        rawRecords.length
      }`,
    );

    //Read the Token from s3://<Bucket>/replaytokens/tokens.json
    this.bucket = this.configService.get('OUTPUT_S3');
    //this.replayTokens = await this.s3RepositoryService.loadJSONKeys<any>(
    //  [`replaytokens/tokens.json`],
    //  this.bucket,
    //);
    if (
      this.replayTokens === undefined ||
      this.replayTokens[0]?.statusCode === 404
    ) {
      this.replayTokens = [];
    }
    this.logger.log(
      `Looking for Replay Tokens: ${JSON.stringify(this.replayTokens)}`,
    );
    for (const element of records) {
      // this.logger.log(`Processing Event: ${JSON.stringify(element)}`);
      // check if replay token is from FEC
    //   if (
    //     element.replayToken &&
    //     this.replayTokens.filter((item) => item.includes(element.replayToken))
    //       .length === 0
    //   ) {
    //     this.logger.log(
    //       `Ignore Event as Replay Token ${
    //         element.replayToken
    //       } Not Found in List: ${JSON.stringify(this.replayTokens)}`,
    //     );
    //     continue;
    //   }
      switch (element.context.component) {
        case Constants.PRODUCER_SERVICE:
          try {
            await this.producerDataService.handleProducerEvents(element);
          } catch (e) {
            this.logError(
              'Error processing producer event for producer-crm-sink',
              element,
              e,
              'producer'
            );
          }
          break;
      }
    }
  }

  logError(message: string, element: any, e: any, eventType: string) {
    const eventError = {
      component: element?.context?.component,
      event: element?.context?.event,
      eventId: element?.id,
      timestamp: element?.timestamp,
      errorDetails: e?.message,
      errorDate: new Date().toISOString(),
      errorType: 'Error',
      identifier: eventType === 'member' ? element.payload.identifiers.member.subscriberId : element.payload.identifier.masterClaimNumber
    };

    this.logger.error(message, JSON.stringify(eventError));
  }
}
