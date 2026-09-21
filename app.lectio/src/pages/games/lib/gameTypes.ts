export type GameType =
  | "options"
  | "boolean"
  | "charades"
  | "one_word"
  | "taboo"
  | "ito"
  | "just_one"
  | "spy";

export type GameDifficulty = "EASY" | "MEDIUM" | "HARD";

export type TimedGameType = "charades" | "one_word" | "taboo";

export interface GameOption {
  text: string;
  isAnswer: boolean;
}

export interface BaseGameQuestion {
  id: string;
  text?: string;
  difficulty?: GameDifficulty | null;
}

export interface OptionsGameQuestion extends BaseGameQuestion {
  text: string;
  options: GameOption[];
  answer: string;
}

export interface BooleanGameQuestion extends BaseGameQuestion {
  text: string;
  options?: GameOption[];
  answer: string;
}

export interface PerformanceGameQuestion extends BaseGameQuestion {
  text: string;
  answer: string;
}

export interface TabooGameQuestion extends BaseGameQuestion {
  text: string;
  forbiddenWords: string[];
  answer: string;
}

export interface ItoGameQuestion {
  id: string;
  text: string;
  min_label: string;
  max_label: string;
  difficulty?: GameDifficulty | null;
}

export interface CategoryAnswerGameQuestion {
  id: string;
  category: string;
  answer: string;
  text?: string;
  difficulty?: GameDifficulty | null;
}

export type SpyGameQuestion = CategoryAnswerGameQuestion;
export type JustOneGameQuestion = CategoryAnswerGameQuestion;

export type GameQuestion =
  | OptionsGameQuestion
  | BooleanGameQuestion
  | PerformanceGameQuestion
  | TabooGameQuestion
  | ItoGameQuestion
  | CategoryAnswerGameQuestion;

export interface Game {
  id: string;
  name: string;
  type: GameType;
  questions: GameQuestion[];
}

export interface GameScore {
  correct: number;
  total: number;
  points: number;
}

export const isTimedGameType = (type: GameType): type is TimedGameType =>
  type === "charades" ||
  type === "one_word" ||
  type === "taboo";
