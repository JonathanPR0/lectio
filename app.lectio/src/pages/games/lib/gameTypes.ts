export type GameType =
  | "options"
  | "boolean"
  | "charades"
  | "drawing"
  | "one_word"
  | "taboo"
  | "ito";

export type GameDifficulty = "EASY" | "MEDIUM" | "HARD";

export type TimedGameType = "charades" | "drawing" | "one_word" | "taboo";

export interface GameOption {
  text: string;
  isAnswer: boolean;
}

export interface BaseGameQuestion {
  id: string;
  text: string;
  difficulty: GameDifficulty | null;
}

export interface OptionsGameQuestion extends BaseGameQuestion {
  options: GameOption[];
  answer: string;
}

export interface BooleanGameQuestion extends BaseGameQuestion {
  options?: GameOption[];
  answer: string;
}

export interface PerformanceGameQuestion extends BaseGameQuestion {
  answer: string;
}

export interface TabooGameQuestion extends BaseGameQuestion {
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

export type GameQuestion =
  | OptionsGameQuestion
  | BooleanGameQuestion
  | PerformanceGameQuestion
  | TabooGameQuestion
  | ItoGameQuestion;

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
  type === "drawing" ||
  type === "one_word" ||
  type === "taboo"||
  type === "ito";
