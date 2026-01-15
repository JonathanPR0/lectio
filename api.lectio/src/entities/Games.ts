import KSUID from "ksuid";

export class Games {
  readonly id: string;
  name: string;
  type: Games.Type;
  questions: Games.QuestionsType[];
  readonly createdAt: Date;

  constructor(attr: Games.Attributes) {
    this.id = attr.id ?? KSUID.randomSync().string;
    this.name = attr.name;
    this.type = attr.type;
    this.questions = attr.questions;
    this.createdAt = attr.createdAt ?? new Date();
  }
}

export namespace Games {
  export type Attributes = {
    id?: string;
    name: string;
    type: Games.Type;
    questions: Games.QuestionsType[];
    createdAt?: Date;
  };
  export type Type = "options" | "boolean";
  export type QuestionsType = {
    id?: string;
    text: string;
    difficulty: Games.Difficulty | null;
    options: Games.OptionsType[];
    answer: string;
  };
  export type OptionsType = {
    text: string;
    isAnswer: boolean;
  };
  export enum Difficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
  }
}
