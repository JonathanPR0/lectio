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
  ito: "Ito",
};

/** Ícone lucide por tipo de jogo */
export const gameTypeIcons: Record<GameType, string> = {
  options: "list-checks",
  boolean: "check-circle-2",
  charades: "person-standing",
  drawing: "pencil",
  one_word: "type",
  taboo: "ban",
  ito: "sliders-horizontal",
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
  ito: "border-chart-6/40 bg-chart-6/90 text-secondary-foreground",
};

export interface GameRuleInfo {
  title: string;
  badge: string;
  summary: string;
  rules: string[];
}

export const gameTypeRules: Record<
  "charades" | "drawing" | "one_word" | "taboo" | "ito",
  GameRuleInfo
> = {
  charades: {
    title: "Mímica",
    badge: "Mímica",
    summary:
      "Faça gestos corporais e mímicas para sua equipe adivinhar a palavra secreta sem emitir nenhum som.",
    rules: [
      "É estritamente proibido falar, emitir sons ou mover os lábios (dublagem).",
      "Não aponte diretamente para pessoas ou objetos presentes no ambiente.",
      "Use apenas linguagem corporal, gestos manuais e expressões faciais.",
    ],
  },
  drawing: {
    title: "Desenho",
    badge: "Desenho",
    summary:
      "Desenhe em um papel, tela ou lousa para sua equipe adivinhar a palavra secreta.",
    rules: [
      "É proibido falar, fazer barulhos ou gesticular durante o desenho.",
      "Não escreva letras, números, símbolos ou caracteres alfabéticos.",
      "Apenas ilustrações visuais e desenhos são válidos.",
    ],
  },
  one_word: {
    title: "Uma Palavra",
    badge: "Uma Palavra",
    summary:
      "Dê exatamente uma única palavra como dica para sua equipe adivinhar a palavra secreta.",
    rules: [
      "Você só pode pronunciar UMA única palavra de pista por tentativa.",
      "Não faça gestos, não use frases e não use derivações diretas da palavra secreta.",
      "Sua equipe deve tentar acertar com base apenas nessa única palavra.",
    ],
  },
  taboo: {
    title: "Não Pode",
    badge: "Não Pode",
    summary:
      "Descreva a palavra secreta para sua equipe adivinhar sem pronunciar nenhuma das palavras proibidas.",
    rules: [
      "Você NÃO pode dizer a palavra secreta nem qualquer uma das palavras proibidas listadas.",
      "É proibido usar derivações, plurais, rimas ou traduções das palavras proibidas.",
      "Use conceitos, analogias, contextos e sinônimos criativos para ajudar sua equipe a acertar.",
    ],
  },
  ito: {
    title: "Ito",
    badge: "Ito",
    summary:
      "Cada jogador recebe um número secreto de 1 a 100. Sem revelar o número, todos se posicionam na escala temática e depois revelam para conferir a ordem!",
    rules: [
      "Cada jogador olha seu número secreto em particular — não mostre para ninguém!",
      "Sem revelar o número, discutam e se posicionem na escala do tema.",
      "Após todos se posicionarem, revelem os números para conferir se a ordem está correta.",
      "Quanto mais próximos da ordem certa, melhor o desempenho do grupo!",
    ],
  },
};

export const getGameTypeRules = (type: GameType): GameRuleInfo | null => {
  if (type === "options" || type === "boolean") return null;
  return (gameTypeRules as Record<string, GameRuleInfo>)[type] ?? null;
};
