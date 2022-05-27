import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { uuid } from 'uuidv4';

@Injectable()
export class SqsClientService {
    private readonly logger: Logger;
    private readonly QUEUE_URL: string;

    //'https://sqs.us-east-1.amazonaws.com/003888721705/MemberCrmSinkQueue.fifo';
    constructor(
        private readonly configService: ConfigService
        ) {
        this.logger = new Logger(SqsClientService.name);
        this.QUEUE_URL =  `producer-crm-sink-${this.configService.get('ENVIRONMENT')}`;
      }

    async sendMessage(message: string) {
        const sqs = new AWS.SQS({
            apiVersion: '2012-11-05',
            region: 'us-east-1' /*use config service and default region*/
        });

        let messageString = JSON.stringify(message);
        this.logger.log(`messageString; ${messageString}`);

        const params = {
          MessageBody: messageString,
          QueueUrl: this.QUEUE_URL,
          MessageDeduplicationId: uuid(), 
          MessageGroupId: "Group1",
        };

        try {   
            return await sqs.sendMessage(params)
            .promise()
            .then((data) => {
              this.logger.log(`Successfully enqueued message; ${data}`);
              return data;
            })
            .catch((err) => {
              this.logger.error(`Failed enqueuing message to message queue; Error: ${err}`);
              return err;
            })
          } catch(err) {
            this.logger.error(`SqsClientService: sendMessage error - The following error was thrown:\n ${err}`);
        }
    }

    async receiveMessage(receiveRequestAttemptId?: string) {
        const sqs = new AWS.SQS({
            apiVersion: '2012-11-05',
            region: 'us-east-1' /*use config service and default region*/
        });

        let params = {
            MessageAttributeNames: [
               "All"
            ],
            QueueUrl: this.QUEUE_URL,
            ReceiveRequestAttemptId: receiveRequestAttemptId
        };

        try {   
            return await sqs.receiveMessage(params)
            .promise()
            .then((data) => {
              this.logger.log(`Successfully dequeued message; ${data}`);
              return data;
            })
            .catch((err) => {
              this.logger.error(`Failed dequeuing message to message queue; Error: ${err}`);
              return err;
            })
          } catch(err) {
            this.logger.error(`SqsClientService: receiveMessage error - The following error was thrown:\n ${err}`);
        }
    }

    async receiveMessages(quantity: number) {
        const sqs = new AWS.SQS({
            apiVersion: '2012-11-05',
            region: 'us-east-1' /*use config service and default region*/
        });

        this.logger.log(`Retrieving ${quantity} messages`);

        const params = {
          MessageBody: JSON.stringify({quantity}),
          QueueUrl: this.QUEUE_URL,
          MessageDeduplicationId: uuid(), 
          MessageGroupId: "Group1",
        };

        try {   
            return await sqs.sendMessage(params)
            .promise()
            .then((data) => {
              this.logger.log(`Successfully enqueued message; ${data}`);
              return data;
            })
            .catch((err) => {
              this.logger.error(`Failed enqueuing message to message queue; Error: ${err}`);
              return err;
            })
          } catch(err) {
            this.logger.error(`SqsClientService: sendMessage error - The following error was thrown:\n ${err}`);
        }
    }

    async deleteMessage(receiptHandle: string) {
         const sqs = new AWS.SQS({
             apiVersion: '2012-11-05',
             region: 'us-east-1' /*use config service and default region*/
         });

         const params = {
            QueueUrl: this.QUEUE_URL,
            ReceiptHandle: receiptHandle
          };
  
          try {   
              return await sqs.deleteMessage(params)
              .promise()
              .then((data) => {
                this.logger.log(`Successfully deleted message from queue; ${data}`);
                return data;
              })
              .catch((err) => {
                this.logger.error(`Failed deleting message from message queue; Error: ${err}`);
                return err;
              })
            } catch(err) {
              this.logger.error(`SqsClientService: deleteMessage error - The following error was thrown:\n ${err}`);
          }
    }

    async getQueueAttributes() {
        const sqs = new AWS.SQS({
            apiVersion: '2012-11-05',
            region: 'us-east-1' /*use config service and default region*/
        });

        const params = {
            AttributeNames: [
               "All"
            ],
            QueueUrl: this.QUEUE_URL
        };

        try {   
            return await sqs.getQueueAttributes(params)
            .promise()
            .then((data) => {
              this.logger.log(`Successfully retrieved attributes for the specified queue; ${data}`);
              return data;
            })
            .catch((err) => {
              this.logger.error(`Failed retrieving attributes for the specified queue; Error: ${err}`);
              return err;
            })
          } catch(err) {
            this.logger.error(`SqsClientService: getQueueAttributes error - The following error was thrown:\n ${err}`);
        }
    }
    
}
