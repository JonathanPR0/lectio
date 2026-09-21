// src/store/gameAnswersStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  generateBalancedQuestionOrder,
  generateRoundNumbers,
  shuffleArray,
} from "@/pages/games/lib/itoGameUtils";

export interface GameAnswer {
  questionId: string;
  answerIndex?: number;
  answerBoolean?: boolean;
  points?: number;
  isCorrect: boolean;
}

export interface GroupScore {
  groupIndex: number;
  correct: number;
  total: number;
  points: number;
}

export interface GameProgress {
  gameId: string;
  answers: Record<string, GameAnswer>;
  questionOrder: number[];
  currentIndex: number;
  timeLimitSeconds?: number;
  autoStartTimer?: boolean;
  groupCount?: number;
  completedAt?: string;
  // Ito specific
  itoPlayerCount?: number;
  itoUsedNumbers?: number[];
  itoRoundNumbers?: Record<string, number[]>; // questionId → [números dos jogadores]
}

export interface GameTimePreferences {
  timeLimitSeconds: number;
  autoStartTimer: boolean;
}

interface GameAnswersState {
  games: Record<string, GameProgress>;
  timePreferences: Record<string, GameTimePreferences>;
  globalItoUsedNumbers: number[];

  initializeGame: (
    gameId: string,
    questionsOrCount: { id: string; difficulty?: string | null }[] | number,
    groupCount?: number,
  ) => void;
  setGameTimeLimit: (
    gameId: string,
    timeLimitSeconds: number,
    autoStartTimer: boolean,
    groupCount?: number,
  ) => void;
  getGameTimePreferences: (gameId: string) => GameTimePreferences | null;
  addGameAnswer: (gameId: string, answer: GameAnswer) => void;
  getGameProgress: (gameId: string) => GameProgress | null;
  getQuestionOrder: (gameId: string) => number[];
  getCurrentQuestionIndex: (gameId: string) => number;
  isQuestionAnswered: (gameId: string, questionId: string) => boolean;
  getQuestionAnswer: (gameId: string, questionId: string) => GameAnswer | null;
  calculateGameScore: (gameId: string) => {
    correct: number;
    total: number;
    points: number;
  };
  calculateGroupScores: (
    gameId: string,
    questions: { id: string }[],
  ) => GroupScore[];
  goToNextQuestion: (gameId: string) => void;
  goToPreviousQuestion: (gameId: string) => void;
  resetGame: (gameId: string) => void;
  // Ito
  setItoConfig: (
    gameId: string,
    playerCount: number,
    timeLimitSeconds?: number,
    autoStartTimer?: boolean,
  ) => void;
  getOrGenerateItoRoundNumbers: (
    gameId: string,
    questionId: string,
    playerCount: number,
  ) => number[];
}

export const useGameAnswersStore = create<GameAnswersState>()(
  persist(
    (set, get) => ({
      games: {},
      timePreferences: {},
      globalItoUsedNumbers: [],

      initializeGame: (gameId, questionsOrCount, groupCount = 1) => {
        const { games } = get();
        if (games[gameId]) return;

        let questionOrder: number[];
        if (Array.isArray(questionsOrCount)) {
          questionOrder = generateBalancedQuestionOrder(
            questionsOrCount,
            groupCount,
          );
        } else {
          questionOrder = shuffleArray(
            Array.from({ length: questionsOrCount }, (_, i) => i),
          );
        }

        set({
          games: {
            ...games,
            [gameId]: {
              gameId,
              answers: {},
              questionOrder,
              currentIndex: 0,
              groupCount,
            },
          },
        });
      },

      setGameTimeLimit: (gameId, timeLimitSeconds, autoStartTimer, groupCount) =>
        set((state) => {
          const game = state.games[gameId];
          return {
            timePreferences: {
              ...(state.timePreferences ?? {}),
              [gameId]: { timeLimitSeconds, autoStartTimer },
            },
            games: {
              ...state.games,
              ...(game
                ? {
                    [gameId]: {
                      ...game,
                      timeLimitSeconds,
                      autoStartTimer,
                      ...(groupCount !== undefined ? { groupCount } : {}),
                    },
                  }
                : {}),
            },
          };
        }),

      getGameTimePreferences: (gameId) => {
        const { timePreferences = {}, games } = get();
        return (
          timePreferences[gameId] ??
          (games[gameId]?.timeLimitSeconds !== undefined &&
          games[gameId]?.autoStartTimer !== undefined
            ? {
                timeLimitSeconds: games[gameId].timeLimitSeconds!,
                autoStartTimer: games[gameId].autoStartTimer!,
              }
            : null)
        );
      },

      addGameAnswer: (gameId, answer) =>
        set((state) => {
          const game = state.games[gameId];
          if (!game) return state;
          return {
            games: {
              ...state.games,
              [gameId]: {
                ...game,
                answers: { ...game.answers, [answer.questionId]: answer },
              },
            },
          };
        }),

      getGameProgress: (gameId) => {
        const { games } = get();
        return games[gameId] || null;
      },

      getQuestionOrder: (gameId) => {
        const { games } = get();
        return games[gameId]?.questionOrder || [];
      },

      getCurrentQuestionIndex: (gameId) => {
        const { games } = get();
        return games[gameId]?.currentIndex || 0;
      },

      isQuestionAnswered: (gameId, questionId) => {
        const { games } = get();
        const game = games[gameId];
        return game ? !!game.answers[questionId] : false;
      },

      getQuestionAnswer: (gameId, questionId) => {
        const { games } = get();
        const game = games[gameId];
        return game?.answers[questionId] || null;
      },

      calculateGameScore: (gameId) => {
        const { games } = get();
        const game = games[gameId];
        if (!game) return { correct: 0, total: 0, points: 0 };
        const answers = Object.values(game.answers);
        const correct = answers.filter((a) => a.isCorrect).length;
        const total = answers.length;
        const points = answers.reduce(
          (score, answer) =>
            score + (answer.isCorrect ? (answer.points ?? 0) : 0),
          0,
        );
        return { correct, total, points };
      },

      calculateGroupScores: (gameId, questions) => {
        const { games } = get();
        const game = games[gameId];
        if (!game || !game.groupCount || game.groupCount <= 1) return [];

        const groupCount = game.groupCount;
        const groupScores: GroupScore[] = Array.from(
          { length: groupCount },
          (_, g) => ({ groupIndex: g, correct: 0, total: 0, points: 0 }),
        );

        game.questionOrder.forEach((originalIndex, orderPos) => {
          const groupIdx = orderPos % groupCount;
          const question = questions[originalIndex];
          if (!question) return;

          const answer = game.answers[question.id];
          if (answer) {
            groupScores[groupIdx].total += 1;
            if (answer.isCorrect) {
              groupScores[groupIdx].correct += 1;
              groupScores[groupIdx].points += answer.points ?? 0;
            }
          }
        });

        return groupScores;
      },

      goToNextQuestion: (gameId) =>
        set((state) => {
          const game = state.games[gameId];
          if (!game) return state;
          return {
            games: {
              ...state.games,
              [gameId]: {
                ...game,
                currentIndex: Math.min(
                  game.currentIndex + 1,
                  game.questionOrder.length - 1,
                ),
              },
            },
          };
        }),

      goToPreviousQuestion: (gameId) =>
        set((state) => {
          const game = state.games[gameId];
          if (!game) return state;
          return {
            games: {
              ...state.games,
              [gameId]: {
                ...game,
                currentIndex: Math.max(game.currentIndex - 1, 0),
              },
            },
          };
        }),

      resetGame: (gameId) =>
        set((state) => {
          const game = state.games[gameId];
          if (!game) return state;
          const totalQuestions = game.questionOrder.length;
          const questionOrder = shuffleArray(
            Array.from({ length: totalQuestions }, (_, i) => i),
          );
          return {
            games: {
              ...state.games,
              [gameId]: {
                ...game,
                answers: {},
                currentIndex: 0,
                questionOrder,
                timeLimitSeconds: undefined,
                autoStartTimer: undefined,
                completedAt: undefined,
                groupCount: undefined,
                itoPlayerCount: undefined,
                itoUsedNumbers: [],
                itoRoundNumbers: {},
              },
            },
          };
        }),

      // ── Ito actions ───────────────────────────────────────────────

      setItoConfig: (gameId, playerCount, timeLimitSeconds, autoStartTimer) =>
        set((state) => {
          const game = state.games[gameId];
          const prevPlayerCount = game?.itoPlayerCount;
          // Se mudou o número de jogadores, limpa as rodadas pré-geradas para não manter arrays de tamanho incorreto
          const shouldResetRounds = prevPlayerCount !== undefined && prevPlayerCount !== playerCount;

          return {
            ...(timeLimitSeconds !== undefined
              ? {
                  timePreferences: {
                    ...(state.timePreferences ?? {}),
                    [gameId]: {
                      timeLimitSeconds,
                      autoStartTimer: autoStartTimer ?? false,
                    },
                  },
                }
              : {}),
            games: {
              ...state.games,
              [gameId]: {
                ...(game ?? {
                  gameId,
                  answers: {},
                  questionOrder: [],
                  currentIndex: 0,
                }),
                itoPlayerCount: playerCount,
                itoUsedNumbers: shouldResetRounds ? [] : (game?.itoUsedNumbers ?? []),
                itoRoundNumbers: shouldResetRounds ? {} : (game?.itoRoundNumbers ?? {}),
                ...(timeLimitSeconds !== undefined
                  ? {
                      timeLimitSeconds,
                      autoStartTimer: autoStartTimer ?? false,
                    }
                  : {}),
              },
            },
          };
        }),

      getOrGenerateItoRoundNumbers: (gameId, questionId, playerCount) => {
        const { games, globalItoUsedNumbers = [] } = get();
        const game = games[gameId];
        if (!game) return [];

        const existing = game.itoRoundNumbers?.[questionId];
        if (
          existing &&
          existing.length === playerCount &&
          !existing.includes(0)
        ) {
          return existing;
        }

        // Combinar números usados globalmente e números já usados nesta partida
        const gameUsed = game.itoUsedNumbers ?? [];
        const allUsed = Array.from(
          new Set([...globalItoUsedNumbers, ...gameUsed]),
        );

        const { numbers: newNumbers, updatedUsedNumbers } =
          generateRoundNumbers(playerCount, allUsed);

        set((state) => {
          const currentGame = state.games[gameId];
          if (!currentGame) return state;
          return {
            globalItoUsedNumbers: updatedUsedNumbers,
            games: {
              ...state.games,
              [gameId]: {
                ...currentGame,
                itoUsedNumbers: Array.from(
                  new Set([
                    ...(currentGame.itoUsedNumbers ?? []),
                    ...newNumbers,
                  ]),
                ),
                itoRoundNumbers: {
                  ...(currentGame.itoRoundNumbers ?? {}),
                  [questionId]: newNumbers,
                },
              },
            },
          };
        });

        return newNumbers;
      },
    }),
    {
      name: "game-answers-storage",
    },
  ),
);
