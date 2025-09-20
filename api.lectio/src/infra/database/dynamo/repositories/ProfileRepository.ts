import { GetCommand, PutCommand, PutCommandInput, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "@infra/clients/dynamoClient";
import { Injectable } from "@kernel/decorators/Injectable";
import { Profile } from "src/entities/Profile";
import { AppConfig } from "src/shared/config/AppConfig";
import { ProfileItem } from "../items/ProfileItem";

@Injectable()
export class ProfileRepository {
  constructor(private readonly config: AppConfig) {}
  async findByAccountId(accountId: string): Promise<Profile | null> {
    const command = new GetCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: ProfileItem.getPK(accountId),
        SK: ProfileItem.getSK(),
      },
    });

    const { Item: profileItem } = await dynamoClient.send(command);

    if (!profileItem) {
      return null;
    }

    return ProfileItem.toEntity(profileItem as ProfileItem.ItemType);
  }

  async save(profile: Profile) {
    const profileItem = ProfileItem.fromEntity(profile).toItem();

    const command = new UpdateCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: profileItem.PK,
        SK: profileItem.SK,
      },
      UpdateExpression:
        "SET #username = :username, #points = :points, #shields = :shields, #streakCount = :streakCount, #lastActivityDate = :lastActivityDate, #lastAnswers = :lastAnswers",
      ExpressionAttributeNames: {
        "#username": "username",
        "#points": "points",
        "#shields": "shields",
        "#streakCount": "streakCount",
        "#lastActivityDate": "lastActivityDate",
        "#lastAnswers": "lastAnswers",
      },
      ExpressionAttributeValues: {
        ":username": profileItem.username,
        ":points": profileItem.points,
        ":shields": profileItem.shields,
        ":streakCount": profileItem.streakCount,
        ":lastActivityDate": profileItem.lastActivityDate,
        ":lastAnswers": profileItem.lastAnswers,
      },
      ReturnValues: "NONE",
    });

    await dynamoClient.send(command);
  }
  getPutCommandInput(profile: Profile): PutCommandInput {
    const profileItem = ProfileItem.fromEntity(profile);
    return {
      TableName: this.config.db.dynamodb.mainTable,
      Item: profileItem.toItem(),
    };
  }
  async create(profile: Profile): Promise<void> {
    await dynamoClient.send(new PutCommand(this.getPutCommandInput(profile)));
  }
}

export namespace ProfileRepository {}
