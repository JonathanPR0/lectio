/**
 * Utilitários para o jogo Ito.
 *
 * Regras do Ito:
 * - Cada jogador recebe um número secreto de 1 a 100.
 * - Os números NÃO se repetem durante toda a partida e ao longo das partidas.
 * - Os jogadores devem se ordenar na escala temática SEM revelar seus números.
 * - Após todos se posicionarem, revelam os números para ver se acertaram a ordem.
 */

/** Embaralha uma cópia do array usando Fisher-Yates */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Gera `count` números únicos de 1 a 100 que ainda não foram usados.
 * Se o pool de números restantes de 1 a 100 for menor que `count`,
 * o conjunto é reiniciado para garantir que SEMPRE haja `count` números válidos (1 a 100).
 */
export function generateRoundNumbers(
  count: number,
  usedNumbers: number[] = [],
): { numbers: number[]; updatedUsedNumbers: number[] } {
  const usedSet = new Set(usedNumbers.filter((n) => n >= 1 && n <= 100));
  let available = Array.from({ length: 100 }, (_, i) => i + 1).filter(
    (n) => !usedSet.has(n),
  );

  let updatedUsed = [...usedNumbers];

  // Se os números disponíveis acabaram ou não dão para todos os jogadores da rodada:
  if (available.length < count) {
    // Reinicia o pool de 1 a 100
    available = Array.from({ length: 100 }, (_, i) => i + 1);
    updatedUsed = [];
  }

  const selected = shuffleArray(available).slice(0, count);
  updatedUsed = [...updatedUsed, ...selected];

  return {
    numbers: selected,
    updatedUsedNumbers: updatedUsed,
  };
}

/** Verifica se há números suficientes disponíveis para uma nova rodada. */
export function hasEnoughNumbers(
  playerCount: number,
  usedNumbers: number[],
): boolean {
  return 100 - usedNumbers.length >= playerCount;
}

/**
 * Gera uma ordem equilibrada de questões distribuídas entre `groupCount` grupos.
 * Garante que cada grupo receba a mesma quantidade de questões e uma proporção
 * justa de dificuldades (EASY, MEDIUM, HARD).
 * As questões são intercaladas (Rodada 1: Grupo 1, Grupo 2... Rodada 2: Grupo 1, Grupo 2...).
 */
export function generateBalancedQuestionOrder(
  questions: { id: string; difficulty?: string | null }[],
  groupCount: number = 1,
): number[] {
  if (groupCount <= 1 || questions.length === 0) {
    return shuffleArray(Array.from({ length: questions.length }, (_, i) => i));
  }

  // 1. Separar índices de questões por dificuldade
  const easyIndices: number[] = [];
  const mediumIndices: number[] = [];
  const hardIndices: number[] = [];
  const otherIndices: number[] = [];

  questions.forEach((q, idx) => {
    if (q.difficulty === "EASY") easyIndices.push(idx);
    else if (q.difficulty === "MEDIUM") mediumIndices.push(idx);
    else if (q.difficulty === "HARD") hardIndices.push(idx);
    else otherIndices.push(idx);
  });

  // Embaralhar cada pote de dificuldade
  const shuffledEasy = shuffleArray(easyIndices);
  const shuffledMedium = shuffleArray(mediumIndices);
  const shuffledHard = shuffleArray(hardIndices);
  const shuffledOther = shuffleArray(otherIndices);

  // 2. Distribuir igualmente para cada grupo
  const groupQuestions: number[][] = Array.from(
    { length: groupCount },
    () => [],
  );

  const distributeBucket = (bucket: number[]) => {
    // Usar apenas múltiplos de groupCount para que cada grupo receba a mesma quantidade
    const usableCount = Math.floor(bucket.length / groupCount) * groupCount;
    for (let i = 0; i < usableCount; i++) {
      const groupIndex = i % groupCount;
      groupQuestions[groupIndex].push(bucket[i]);
    }
  };

  distributeBucket(shuffledEasy);
  distributeBucket(shuffledMedium);
  distributeBucket(shuffledHard);
  distributeBucket(shuffledOther);

  const minQuestions = Math.min(...groupQuestions.map((g) => g.length));

  // Se algum grupo ficou com 0 questões (ex: poucas questões divididas em baldes), fazer distribuição direta
  if (minQuestions === 0 && questions.length >= groupCount) {
    const allShuffled = shuffleArray(
      Array.from({ length: questions.length }, (_, i) => i),
    );
    const usableTotal =
      Math.floor(allShuffled.length / groupCount) * groupCount;
    const fallbackGroups: number[][] = Array.from(
      { length: groupCount },
      () => [],
    );
    for (let i = 0; i < usableTotal; i++) {
      fallbackGroups[i % groupCount].push(allShuffled[i]);
    }
    const result: number[] = [];
    const qPerGroup = usableTotal / groupCount;
    for (let round = 0; round < qPerGroup; round++) {
      for (let g = 0; g < groupCount; g++) {
        result.push(fallbackGroups[g][round]);
      }
    }
    return result;
  }

  // Igualar a quantidade de questões em cada grupo ao mínimo encontrado
  for (let g = 0; g < groupCount; g++) {
    groupQuestions[g] = shuffleArray(groupQuestions[g].slice(0, minQuestions));
  }

  // 3. Intercalar questões entre os grupos: [G0-Q0, G1-Q0, G2-Q0, G0-Q1, G1-Q1, G2-Q1, ...]
  const result: number[] = [];
  for (let round = 0; round < minQuestions; round++) {
    for (let g = 0; g < groupCount; g++) {
      result.push(groupQuestions[g][round]);
    }
  }

  return result;
}

/** Definição de cor de cada jogador baseada em variáveis CSS que se adaptam automaticamente a tema claro e escuro */
export interface PlayerColor {
  index: number;
  label: string;
  /** Fundo do card virado (face oculta) */
  hiddenBg: string;
  /** Borda do card oculto */
  hiddenBorder: string;
  /** Fundo do ícone circular central */
  iconBg: string;
  /** Fundo do card revelado (número visível) */
  revealedBg: string;
  /** Texto sobre o fundo revelado */
  revealedText: string;
  /** Cor do rótulo / texto de destaque na face oculta */
  accentColor: string;
}

/** Paleta de 8 jogadores com suporte nativo a tema claro (alto contraste) e escuro (cores vibrantes do chart) */
export const PLAYER_COLORS: PlayerColor[] = [
  {
    index: 0,
    label: "Jogador 1",
    hiddenBg: "var(--player-0-bg)",
    hiddenBorder: "var(--player-0-border)",
    iconBg: "var(--player-0-icon-bg)",
    revealedBg: "var(--player-0-rev-bg)",
    revealedText: "var(--player-0-rev-text)",
    accentColor: "var(--player-0-accent)",
  },
  {
    index: 1,
    label: "Jogador 2",
    hiddenBg: "var(--player-1-bg)",
    hiddenBorder: "var(--player-1-border)",
    iconBg: "var(--player-1-icon-bg)",
    revealedBg: "var(--player-1-rev-bg)",
    revealedText: "var(--player-1-rev-text)",
    accentColor: "var(--player-1-accent)",
  },
  {
    index: 2,
    label: "Jogador 3",
    hiddenBg: "var(--player-2-bg)",
    hiddenBorder: "var(--player-2-border)",
    iconBg: "var(--player-2-icon-bg)",
    revealedBg: "var(--player-2-rev-bg)",
    revealedText: "var(--player-2-rev-text)",
    accentColor: "var(--player-2-accent)",
  },
  {
    index: 3,
    label: "Jogador 4",
    hiddenBg: "var(--player-3-bg)",
    hiddenBorder: "var(--player-3-border)",
    iconBg: "var(--player-3-icon-bg)",
    revealedBg: "var(--player-3-rev-bg)",
    revealedText: "var(--player-3-rev-text)",
    accentColor: "var(--player-3-accent)",
  },
  {
    index: 4,
    label: "Jogador 5",
    hiddenBg: "var(--player-4-bg)",
    hiddenBorder: "var(--player-4-border)",
    iconBg: "var(--player-4-icon-bg)",
    revealedBg: "var(--player-4-rev-bg)",
    revealedText: "var(--player-4-rev-text)",
    accentColor: "var(--player-4-accent)",
  },
  {
    index: 5,
    label: "Jogador 6",
    hiddenBg: "var(--player-5-bg)",
    hiddenBorder: "var(--player-5-border)",
    iconBg: "var(--player-5-icon-bg)",
    revealedBg: "var(--player-5-rev-bg)",
    revealedText: "var(--player-5-rev-text)",
    accentColor: "var(--player-5-accent)",
  },
  {
    index: 6,
    label: "Jogador 7",
    hiddenBg: "var(--player-6-bg)",
    hiddenBorder: "var(--player-6-border)",
    iconBg: "var(--player-6-icon-bg)",
    revealedBg: "var(--player-6-rev-bg)",
    revealedText: "var(--player-6-rev-text)",
    accentColor: "var(--player-6-accent)",
  },
  {
    index: 7,
    label: "Jogador 8",
    hiddenBg: "var(--player-7-bg)",
    hiddenBorder: "var(--player-7-border)",
    iconBg: "var(--player-7-icon-bg)",
    revealedBg: "var(--player-7-rev-bg)",
    revealedText: "var(--player-7-rev-text)",
    accentColor: "var(--player-7-accent)",
  },
];
