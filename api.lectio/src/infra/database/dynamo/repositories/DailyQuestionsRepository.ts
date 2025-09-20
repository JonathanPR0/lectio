import { GetCommand, PutCommand, PutCommandInput, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "@infra/clients/dynamoClient";
import { Injectable } from "@kernel/decorators/Injectable";
import { DailyQuestions } from "src/entities/DailyQuestions";
import { AppConfig } from "src/shared/config/AppConfig";
import { DailyQuestionsItem } from "../items/DailyQuestionsItem";

@Injectable()
export class DailyQuestionsRepository {
  constructor(private readonly config: AppConfig) {}
  async findById(id: string): Promise<DailyQuestions | null> {
    const command = new GetCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: DailyQuestionsItem.getPK({ id }),
        SK: DailyQuestionsItem.getSK(),
      },
    });

    const { Item: questionsItem } = await dynamoClient.send(command);

    if (!questionsItem) {
      return null;
    }

    return DailyQuestionsItem.toEntity(questionsItem as DailyQuestionsItem.ItemType);
  }
  async findByDate(date: Date): Promise<DailyQuestions | null> {
    // Consulta pela GSI1 usando QueryCommand
    const { QueryCommand } = await import("@aws-sdk/lib-dynamodb");
    const command = new QueryCommand({
      IndexName: "GSI1",
      TableName: this.config.db.dynamodb.mainTable,
      KeyConditionExpression: "GSI1PK = :gsi1pk",
      ExpressionAttributeValues: {
        ":gsi1pk": DailyQuestionsItem.getGSI1PK({ date }),
      },
      Limit: 1,
    });

    const { Items } = await dynamoClient.send(command);

    if (!Items || Items.length === 0) {
      return null;
    }

    return DailyQuestionsItem.toEntity(Items[0] as DailyQuestionsItem.ItemType);
  }
  async save(questions: DailyQuestions) {
    const questionsItem = DailyQuestionsItem.fromEntity(questions).toItem();
    const command = new UpdateCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: questionsItem.PK,
        SK: questionsItem.SK,
      },
      UpdateExpression: "SET #date = :date, #questions = :questions",
      ExpressionAttributeNames: {
        "#date": "date",
        "#questions": "questions",
      },
      ExpressionAttributeValues: {
        ":date": questionsItem.date,
        ":questions": questionsItem.questions,
      },
      ReturnValues: "NONE",
    });

    await dynamoClient.send(command);
  }
  getPutCommandInput(questions: DailyQuestions): PutCommandInput {
    const questionsItem = DailyQuestionsItem.fromEntity(questions);
    return {
      TableName: this.config.db.dynamodb.mainTable,
      Item: questionsItem.toItem(),
    };
  }
  async create(questions: DailyQuestions): Promise<void> {
    await dynamoClient.send(new PutCommand(this.getPutCommandInput(questions)));
  }
}

export namespace DailyQuestionsRepository {}
