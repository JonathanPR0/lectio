import KSUID from "ksuid";
import { Games } from "src/entities/Games";

export class GamesItem {
  static readonly entityType = "Games";

  private readonly keys: GamesItem.Keys;

  constructor(private readonly attrs: GamesItem.Attributes) {
    this.keys = {
      PK: GamesItem.getPK({
        id: this.attrs.id!,
      }),
      SK: GamesItem.getSK(),
      GSI1PK: GamesItem.getGSI1PK(),
      GSI1SK: GamesItem.getGSI1SK({
        name: this.attrs.name,
      }),
    };
  }

  toItem(): GamesItem.ItemType {
    return {
      ...this.keys,
      ...this.attrs,
      entityType: GamesItem.entityType,
    };
  }

  static fromEntity(game: Games) {
    return new GamesItem({
      ...game,
      questions: game.questions.map((q) => ({
        id: q.id ?? KSUID.randomSync().string,
        ...q,
      })),
      createdAt: game.createdAt.toISOString(),
    });
  }

  static toEntity(GamesItem: GamesItem.ItemType) {
    return new Games({
      id: GamesItem.id,
      name: GamesItem.name,
      type: GamesItem.type,
      questions: GamesItem.questions,
      createdAt: new Date(GamesItem.createdAt),
    });
  }

  static getPK({ id }: GamesItem.PKParams): GamesItem.Keys["PK"] {
    return `GAMES#${id}`;
  }

  static getSK(): GamesItem.Keys["SK"] {
    return `GAMES`;
  }

  static getGSI1PK(): GamesItem.Keys["GSI1PK"] {
    return `GAMES`;
  }
  static getGSI1SK({ name }: GamesItem.GSI1PKParams): GamesItem.Keys["GSI1SK"] {
    return `${name}`;
  }
}

export namespace GamesItem {
  export type Keys = {
    PK: `GAMES#${string}`;
    SK: `GAMES`;
    GSI1PK: `GAMES`;
    GSI1SK: `${string}`;
  };

  export type Attributes = {
    id?: string;
    name: string;
    type: "options" | "boolean";
    questions: Games.QuestionsType[];
    createdAt: string;
  };

  export type ItemType = Keys &
    Attributes & {
      entityType: "Games";
    };

  export type PKParams = {
    id: string;
  };
  export type GSI1PKParams = {
    name: string;
  };
}
