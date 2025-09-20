import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "@infra/clients/sqsClient";
import { Injectable } from "@kernel/decorators/Injectable";
import { DailyText } from "scripts/scrape";
import { AppConfig } from "src/shared/config/AppConfig";

@Injectable()
export class DailyTextsQueueGateway {
  constructor(private readonly config: AppConfig) {}

  async publish(message: DailyTextsQueueGateway.Message) {
    const command = new SendMessageCommand({
      QueueUrl: this.config.queues.dailyTextsQueueUrl,
      MessageBody: JSON.stringify(message),
    });

    await sqsClient.send(command);
  }
}

export namespace DailyTextsQueueGateway {
  export type Message = { dailyText: DailyText };
}
