import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "@infra/clients/sqsClient";
import { Injectable } from "@kernel/decorators/Injectable";
import { DailyQuestions } from "src/entities/DailyQuestions";
import { AppConfig } from "src/shared/config/AppConfig";

@Injectable()
export class DailyQuestionsQueueGateway {
  constructor(private readonly config: AppConfig) {}

  async publish(message: DailyQuestionsQueueGateway.Message) {
    const command = new SendMessageCommand({
      QueueUrl: this.config.queues.dailyQuestionsQueueUrl,
      MessageBody: JSON.stringify(message),
    });

    await sqsClient.send(command);
  }
}

export namespace DailyQuestionsQueueGateway {
  export type Message = {
    date: Date;
    questions: DailyQuestions.QuestionsType[];
  };
}
