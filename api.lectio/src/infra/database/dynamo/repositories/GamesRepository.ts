import {
  GetCommand,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "@infra/clients/dynamoClient";
import { Injectable } from "@kernel/decorators/Injectable";
import { Games } from "src/entities/Games";
import { AppConfig } from "src/shared/config/AppConfig";
import { GamesItem } from "../items/GamesItem";

@Injectable()
export class GamesRepository {
  constructor(private readonly config: AppConfig) {}
  async findById(id: string): Promise<Games | null> {
    const command = new GetCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: GamesItem.getPK({ id }),
        SK: GamesItem.getSK(),
      },
    });

    const { Item: gamesItem } = await dynamoClient.send(command);

    if (!gamesItem) {
      return null;
    }

    return GamesItem.toEntity(gamesItem as GamesItem.ItemType);
  }
  async findByName(name: string): Promise<Games | null> {
    const command = new QueryCommand({
      IndexName: "GSI1",
      TableName: this.config.db.dynamodb.mainTable,
      Limit: 1,
      KeyConditionExpression: "#GSI1PK = :GSI1PK AND #GSI1SK = :GSI1SK",
      ExpressionAttributeNames: {
        "#GSI1PK": "GSI1PK",
        "#GSI1SK": "GSI1SK",
      },
      ExpressionAttributeValues: {
        ":GSI1PK": GamesItem.getGSI1PK(),
        ":GSI1SK": GamesItem.getGSI1SK({ name }),
      },
    });
    const { Items = [] } = await dynamoClient.send(command);
    const games = Items[0] as GamesItem.ItemType | undefined;
    if (!games) {
      return null;
    }
    return GamesItem.toEntity(games);
  }
  async save(questions: Games) {
    const gamesItem = GamesItem.fromEntity(questions).toItem();
    const command = new UpdateCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: gamesItem.PK,
        SK: gamesItem.SK,
      },
      UpdateExpression: "SET #name = :name, #type = :type,#questions = :questions",
      ExpressionAttributeNames: {
        "#name": "name",
        "#type": "type",
        "#questions": "questions",
      },
      ExpressionAttributeValues: {
        ":name": gamesItem.name,
        ":type": gamesItem.type,
        ":questions": gamesItem.questions,
      },
      ReturnValues: "NONE",
    });

    await dynamoClient.send(command);
  }
  getPutCommandInput(questions: Games): PutCommandInput {
    const gamesItem = GamesItem.fromEntity(questions);
    return {
      TableName: this.config.db.dynamodb.mainTable,
      Item: gamesItem.toItem(),
    };
  }
  async create(questions: Games): Promise<void> {
    await dynamoClient.send(new PutCommand(this.getPutCommandInput(questions)));
  }
}

export namespace GamesRepository {}
