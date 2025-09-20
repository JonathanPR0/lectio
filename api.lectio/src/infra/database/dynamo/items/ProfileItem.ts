import { Profile } from "src/entities/Profile";
import { AccountItem } from "./AccountItem";

export class ProfileItem {
  static readonly entityType = "Profile";
  private readonly keys: ProfileItem.Keys;
  constructor(private readonly attrs: ProfileItem.Attributes) {
    this.keys = {
      PK: ProfileItem.getPK(attrs.accountId),
      SK: ProfileItem.getSK(),
      GSI1PK: ProfileItem.getGSI1PK(attrs.username),
      GSI1SK: ProfileItem.getGSI1SK(),
    };
  }
  static fromEntity(profile: Profile): ProfileItem {
    const lastAnswers = profile.lastAnswers
      ? profile.lastAnswers.map((answer) => ({
          ...answer,
          answeredAt: answer.answeredAt.toISOString(),
        }))
      : [];
    return new ProfileItem({
      ...profile,
      lastActivityDate: profile.lastActivityDate.toISOString(),
      createdAt: profile.createdAt.toISOString(),
      lastAnswers,
    });
  }
  static toEntity(profileItem: ProfileItem.ItemType): Profile {
    const lastAnswers = profileItem.lastAnswers
      ? profileItem.lastAnswers.map((answer) => ({
          ...answer,
          answeredAt: new Date(answer.answeredAt),
        }))
      : [];

    return new Profile({
      accountId: profileItem.accountId,
      username: profileItem.username,
      points: profileItem.points,
      shields: profileItem.shields,
      streakCount: profileItem.streakCount,
      lastActivityDate: new Date(profileItem.lastActivityDate),
      createdAt: new Date(profileItem.createdAt),
      lastAnswers,
    });
  }
  toItem(): ProfileItem.ItemType {
    return {
      entityType: ProfileItem.entityType,
      ...this.attrs,
      ...this.keys,
    };
  }
  static getPK(id: string): ProfileItem.Keys["PK"] {
    return `ACCOUNT#${id}`;
  }
  static getSK(): ProfileItem.Keys["SK"] {
    return `ACCOUNT#PROFILE`;
  }
  static getGSI1PK(username: string): ProfileItem.Keys["GSI1PK"] {
    return `PROFILE#${username}`;
  }
  static getGSI1SK(): ProfileItem.Keys["GSI1SK"] {
    return `PROFILE`;
  }
}

export namespace ProfileItem {
  export type Attributes = {
    accountId: string;
    username: string;
    points: number;
    shields: number;
    streakCount: number;
    lastActivityDate: string;
    createdAt: string;
    lastAnswers?: {
      dailyQuestionsId: string;
      questionId: number;
      answeredAt: string;
      userAnswerIndex: number;
      answer: string;
      answerIndex: number;
    }[];
  };

  export type Keys = {
    PK: AccountItem.Keys["PK"];
    SK: `ACCOUNT#PROFILE`;
    GSI1PK: `PROFILE#${string}`;
    GSI1SK: `PROFILE`;
  };
  export type ItemType = Attributes & Keys & { entityType: "Profile" };
}
