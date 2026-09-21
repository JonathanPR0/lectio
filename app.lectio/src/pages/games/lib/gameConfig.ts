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
  one_word: "Uma Palavra",
  taboo: "Não Pode",
  ito: "Ito",
  just_one: "Só Uma",
  spy: "Espião"
};

/** Ícone lucide por tipo de jogo */
export const gameTypeIcons: Record<GameType, string> = {
  options: "list-checks",
  boolean: "check-circle-2",
  charades: "person-standing",
  one_word: "type",
  taboo: "ban",
  ito: "sliders-horizontal",
  just_one: "key-round",
  spy: "user-x",
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
  one_word: "border-chart-4/40 bg-chart-4/90 text-secondary-foreground",
  taboo: "border-chart-5/40 bg-chart-5/90 text-secondary-foreground",
  ito: "border-chart-6/40 bg-chart-6/90 text-secondary-foreground",
  just_one: "border-chart-3/40 bg-chart-3/90 text-secondary-foreground",
  spy: "border-chart-7/40 bg-chart-7/90 text-secondary-foreground",
};

export interface GameRuleInfo {
  title: string;
  badge: string;
  summary: string;
  rules: string[];
}

export const gameTypeRules: Record<
  "charades" | "one_word" | "taboo" | "ito" | "just_one" | "spy",
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
  just_one: {
    title: "Apenas Uma",
    badge: "Apenas Uma",
    summary:
      "Um jogador tenta adivinhar a palavra secreta enquanto os outros fornecem exatamente uma palavra de pista cada. Pistas repetidas são anuladas!",
    rules: [
      "O jogador da vez vê apenas a categoria da palavra e não deve olhar a resposta.",
      "Os outros jogadores olham a palavra secreta e escrevem 1 única palavra como pista.",
      "Antes de mostrar ao adivinhador, comparem as pistas: qualquer pista idêntica é cancelada!",
      "Se uma palavra for muito difícil, o grupo pode trocá-la por outra.",
    ],
  },
  spy: {
    title: "Descubra o Espião",
    badge: "Espião",
    summary:
      "Um dos jogadores é o espião e só conhece a categoria. Todos os outros sabem a palavra/local secreto. Façam perguntas para descobrir quem é o espião!",
    rules: [
      "Cada jogador vira seu cartão em segredo para conferir seu papel.",
      "O espião não conhece o local/palavra secreta, apenas a categoria geral.",
      "Os jogadores conversam e fazem perguntas entre si sobre o tema sem entregar a resposta.",
      "Ao final, votem: se os jogadores descobrirem o espião, cada inocente ganha 1 ponto. Se o espião vencer, ele ganha 2 pontos!",
    ],
  },
};

export const getGameTypeRules = (type: GameType): GameRuleInfo | null => {
  if (type === "options" || type === "boolean") return null;
  return (gameTypeRules as Record<string, GameRuleInfo>)[type] ?? null;
};
