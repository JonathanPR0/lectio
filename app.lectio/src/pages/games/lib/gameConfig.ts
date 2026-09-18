import type { GameDifficulty, GameType } from "./gameTypes";

export const difficultyPoints: Record<GameDifficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
};

export const gameTypeLabels: Record<GameType, string> = {
  options: "Opções",
  boolean: "Verdadeiro/Falso",
  charades: "Mímica",
  drawing: "Desenho",
  one_word: "Uma Palavra",
  taboo: "Não Pode",
};

/** Ícone lucide por tipo de jogo */
export const gameTypeIcons: Record<GameType, string> = {
  options: "list-checks",
  boolean: "check-circle-2",
  charades: "person-standing",
  drawing: "pencil",
  one_word: "type",
  taboo: "ban",
};

/**
 * Cores de badge por tipo de jogo.
 * "quiz" → jogos de escolha (options/boolean)
 * "performance" → jogos performáticos temporizados
 */
export const gameTypeCategory = (type: GameType): "quiz" | "performance" => {
  return type === "options" || type === "boolean" ? "quiz" : "performance";
};

export const getDifficultyLabel = (difficulty: GameDifficulty): string => {
  const labels: Record<GameDifficulty, string> = {
    EASY: "Fácil",
    MEDIUM: "Médio",
    HARD: "Difícil",
  };

  return labels[difficulty];
};

export const getDifficultyColor = (difficulty: GameDifficulty): string => {
  const colors: Record<GameDifficulty, string> = {
    EASY: "text-success bg-success/10 border-success/20",
    MEDIUM: "text-warning bg-warning/10 border-warning/20",
    HARD: "text-destructive bg-destructive/10 border-destructive/20",
  };
  return colors[difficulty];
};

export const gameTypeBadgeColors: Record<GameType, string> = {
  options: "border-chart-1/40 bg-chart-1/90 text-secondary-foreground",
  boolean: "border-secondary/40 bg-secondary/80 text-secondary-foreground",
  charades: "border-chart-2/40 bg-chart-2/90 text-secondary-foreground",
  drawing: "border-chart-3/40 bg-chart-3/90 text-secondary-foreground",
  one_word: "border-chart-4/40 bg-chart-4/90 text-secondary-foreground",
  taboo: "border-chart-5/40 bg-chart-5/90 text-secondary-foreground",
};
