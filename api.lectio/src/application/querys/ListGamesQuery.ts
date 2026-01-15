import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "@infra/clients/dynamoClient";
import { GamesItem } from "@infra/database/dynamo/items/GamesItem";
import { Injectable } from "@kernel/decorators/Injectable";
import { Games } from "src/entities/Games";
import { AppConfig } from "src/shared/config/AppConfig";

@Injectable()
export class ListGamesQuery {
  constructor(private readonly config: AppConfig) {}

  async execute(): Promise<ListGamesQuery.Output> {
    const command = new QueryCommand({
      IndexName: "GSI1",
      TableName: this.config.db.dynamodb.mainTable,
      KeyConditionExpression: "#GSI1PK = :GSI1PK",
      ExpressionAttributeNames: {
        "#GSI1PK": "GSI1PK",
      },
      ExpressionAttributeValues: {
        ":GSI1PK": GamesItem.getGSI1PK(),
      },
    });

    const { Items = [] } = await dynamoClient.send(command);
    const items = Items as ListGamesQuery.GamesItemType[];

    const games: ListGamesQuery.Output["games"] = items.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      questionsQtde: item.questions.length,
    }));

    return {
      games,
    };
  }
}

export namespace ListGamesQuery {
  export type GamesItemType = {
    GSI1PK: string;
    id: string;
    name: string;
    type: Games.Type;
    questions: Games.QuestionsType[];
    createdAt: string;
  };

  export type Output = {
    games: {
      id: string;
      name: string;
      type: Games.Type;
    }[];
  };
}
