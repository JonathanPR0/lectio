export type GameType =
  | "options"
  | "boolean"
  | "charades"
  | "drawing"
  | "one_word"
  | "taboo";

export type GameDifficulty = "EASY" | "MEDIUM" | "HARD";

export type TimedGameType = "charades" | "drawing" | "one_word" | "taboo";

export interface GameOption {
  text: string;
  isAnswer: boolean;
}

export interface GameQuestion {
  id: string;
  text: string;
  options?: GameOption[];
  answer: string;
  forbiddenWords?: string[];
  difficulty: GameDifficulty | null;
}

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
  type === "taboo";
