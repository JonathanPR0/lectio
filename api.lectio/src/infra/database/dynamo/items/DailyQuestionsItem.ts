import { DailyQuestions } from "src/entities/DailyQuestions";
import { normalizeUTCDate } from "utils/normalizers";

export class DailyQuestionsItem {
  static readonly entityType = "DailyQuestions";

  private readonly keys: DailyQuestionsItem.Keys;

  constructor(private readonly attrs: DailyQuestionsItem.Attributes) {
    this.keys = {
      PK: DailyQuestionsItem.getPK({
        id: this.attrs.id!,
      }),
      SK: DailyQuestionsItem.getSK(),
      GSI1PK: DailyQuestionsItem.getGSI1PK({
        date: new Date(this.attrs.date),
      }),
      GSI1SK: DailyQuestionsItem.getGSI1SK(),
    };
  }

  toItem(): DailyQuestionsItem.ItemType {
    return {
      ...this.keys,
      ...this.attrs,
      entityType: DailyQuestionsItem.entityType,
    };
  }

  static fromEntity(Dailyquestions: DailyQuestions) {
    return new DailyQuestionsItem({
      ...Dailyquestions,
      date: normalizeUTCDate(Dailyquestions.date).toISOString(),
      createdAt: normalizeUTCDate(Dailyquestions.createdAt).toISOString(),
    });
  }

  static toEntity(DailyquestionsItem: DailyQuestionsItem.ItemType) {
    return new DailyQuestions({
      id: DailyquestionsItem.id,
      date: new Date(DailyquestionsItem.date),
      questions: DailyquestionsItem.questions,
      createdAt: new Date(DailyquestionsItem.createdAt),
    });
  }

  static getPK({ id }: DailyQuestionsItem.PKParams): DailyQuestionsItem.Keys["PK"] {
    return `DAILY_QUESTIONS#${id}`;
  }

  static getSK(): DailyQuestionsItem.Keys["SK"] {
    return `DAILY_QUESTIONS`;
  }

  static getGSI1PK({ date }: DailyQuestionsItem.GSI1PKParams): DailyQuestionsItem.Keys["GSI1PK"] {
    const normalizedDate = normalizeUTCDate(date);
    const year = normalizedDate.getFullYear();
    const month = String(normalizedDate.getMonth() + 1).padStart(2, "0");
    const day = String(normalizedDate.getDate()).padStart(2, "0");

    return `DAILY_QUESTIONS#${year}-${month}-${day}`;
  }

  static getGSI1SK(): DailyQuestionsItem.Keys["GSI1SK"] {
    return `DAILY_QUESTIONS`;
  }
}

export namespace DailyQuestionsItem {
  export type Keys = {
    PK: `DAILY_QUESTIONS#${string}`;
    SK: `DAILY_QUESTIONS`;
    GSI1PK: `DAILY_QUESTIONS#${string}-${string}-${string}`;
    GSI1SK: `DAILY_QUESTIONS`;
  };

  export type Attributes = {
    id?: string;
    date: string;
    questions: DailyQuestions.QuestionsType[];
    createdAt: string;
  };

  export type ItemType = Keys &
    Attributes & {
      entityType: "DailyQuestions";
    };

  export type PKParams = {
    id: string;
  };
  export type GSI1PKParams = {
    date: Date;
  };
}
