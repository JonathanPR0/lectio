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
  export type Type =
    | "options"
    | "boolean"
    | "charades"
    | "drawing"
    | "one_word"
    | "taboo"
    | "ito";
  export type BaseQuestion = {
    id?: string;
    text: string;
    difficulty: Games.Difficulty | null;
  };

  export type OptionsQuestion = BaseQuestion & {
    options: Games.OptionsType[];
    answer: string;
  };

  export type BooleanQuestion = BaseQuestion & {
    options?: Games.OptionsType[];
    answer: string;
  };

  export type PerformanceQuestion = BaseQuestion & {
    answer: string;
  };

  export type TabooQuestion = BaseQuestion & {
    forbiddenWords: string[];
    answer: string;
  };

  export type ItoQuestion = {
    id?: string;
    text: string;
    min_label: string;
    max_label: string;
    difficulty?: Games.Difficulty | null;
  };

  export type QuestionsType =
    | OptionsQuestion
    | BooleanQuestion
    | PerformanceQuestion
    | TabooQuestion
    | ItoQuestion;

  export type OptionsType = {
    text: string;
    isAnswer: boolean;
  };

  export enum Difficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
  }

  export const DifficultyPoints: Record<Difficulty, number> = {
    [Difficulty.EASY]: 1,
    [Difficulty.MEDIUM]: 2,
    [Difficulty.HARD]: 3,
  };
}

