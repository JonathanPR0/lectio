import KSUID from "ksuid";

export class DailyQuestions {
  readonly id: string;
  date: Date;
  questions: DailyQuestions.QuestionsType[];
  readonly createdAt: Date;

  constructor(attr: DailyQuestions.Attributes) {
    this.id = attr.id ?? KSUID.randomSync().string;
    this.date = attr.date;
    this.questions = attr.questions;
    this.createdAt = attr.createdAt ?? new Date();
  }
}

export namespace DailyQuestions {
  export type Attributes = {
    id?: string;
    date: Date;
    questions: DailyQuestions.QuestionsType[];
    createdAt?: Date;
  };
  export type QuestionsType = {
    id: number;
    text: string;
    difficulty: DailyQuestions.Difficulty;
    points: number;
    options: string[];
    correctOptionIndex: number;
    answer: string;
  };
  export enum Difficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
  }
}
