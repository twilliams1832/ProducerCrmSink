import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsClientService } from 'src/sqs-client/sqs-client.service'

enum ProducerEventsPrefixes {
    "Address" = "Address",
    "AHIPCertification" = "AHIPCertification",
    "BankInfo" = "BankInfo",
    "BankInfoHierarchy" = "BankInfoHierarchy",
    "BankInfoHierarchy viewed" = "BankInfoHierarchy viewed",
    "BankInfo viewed" = "BankInfo viewed",
    "Certification" = "Certification",
    "CertificationPeriod" = "CertificationPeriod",
    "Client" = "Client",
    "Email" = "Email",
    "EOInsurancePolicy" = "EOInsurancePolicy",
    "ExternalIdentifier" = "ExternalIdentifier",
    "License" = "License",
    "LineOfAuthority" = "LineOfAuthority",
    "Location" = "Location",
    "Market" = "Market",
    "PhoneNumber" = "PhoneNumber",
    "ProducerAppointment" = "ProducerAppointment",
    "ProducerBaseMarket" = "ProducerBaseMarket",
    "ProducerHierarchy" = "ProducerHierarchy",
    "Producers" = "Producers",
    "Producers viewed" = "Producers viewed",
    "Product" = "Product",
    "ProductRegion" = "ProductRegion",
    "Region" = "Region",
    "TaxInfo" = "TaxInfo",
    "TaxInfoHierarchy" = "TaxInfoHierarchy",
    "TaxInfoHierarchy viewed" = "TaxInfoHierarchy viewed",
    "TaxInfo viewed" = "TaxInfo viewed",
    "Training" = "Training",
}

enum ProducerEventsSuffixes {
    "CREATE" = "-create",
    "UPDATE" = "-update",
    "DELETE" = "-delete"
}

@Injectable()
export class ProducerDataService {
  private readonly logger: Logger;

  constructor(
    private configService: ConfigService, 
    private readonly sqsClientService: SqsClientService,
  ) {
    this.logger = new Logger(ProducerDataService.name);
  }

  /**
   * This handles all the member event calls to process an event based on the event type.
   *
   * @param memberEvent Member event being passed from the lambda function.
   */
  async handleProducerEvents(producerEvent: any) {
    this.logger.log(`Producer Event: ${JSON.stringify(producerEvent)}`);

    const eventString = producerEvent.context.event;
    if(eventString.includes(ProducerEventsSuffixes.CREATE)) {
        this.handleCreateEvents(producerEvent);
    } 
    else if(eventString.includes(ProducerEventsSuffixes.UPDATE)) {
        this.handleUpdateEvents(producerEvent);
    } 
    else if(eventString.includes(ProducerEventsSuffixes.DELETE)) {
        this.handleDeleteEvents(producerEvent);
    }
    else
    {
        this.logger.error(`Invalid producer event type ${eventString}`);
    }
  }

  async handleCreateEvents(producerEvent: any)
  {
    return await this.sqsClientService.sendMessage(producerEvent);
  }

  async handleUpdateEvents(producerEvent: any)
  {
    return await this.sqsClientService.sendMessage(producerEvent);
  }

  async handleDeleteEvents(producerEvent: any)
  {
    return await this.sqsClientService.sendMessage(producerEvent);
  }
}
