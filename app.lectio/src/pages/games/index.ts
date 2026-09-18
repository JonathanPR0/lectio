// Re-exports públicos da rota de jogos
export { GamesPage } from "./GamesPage";
export { GameQuestions } from "./GameQuestions";

// Tipos públicos
export type { GameType, GameQuestion, Game, GameScore } from "./lib/gameTypes";
export { isTimedGameType } from "./lib/gameTypes";
export { gameTypeLabels, difficultyPoints } from "./lib/gameConfig";
