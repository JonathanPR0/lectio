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
  // Spy specific
  spyPlayerCount?: number;
  spyRounds?: Record<string, { spyIndex: number; winner?: "spy" | "players" }>;
  spyScores?: number[]; // [p0_pts, p1_pts, ...]
  // Just One specific
  justOneReserveIndices?: number[]; // indices de questões guardadas no baralho reserva
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
  initializeJustOneGame: (
    gameId: string,
    questionsOrCount: { id: string }[] | number,
  ) => void;
  swapJustOneQuestion: (
    gameId: string,
    currentOrderIndex: number,
    totalQuestionsCount?: number,
  ) => number | null;
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
  // Spy
  setSpyConfig: (gameId: string, playerCount: number) => void;
  getOrGenerateSpyRound: (
    gameId: string,
    questionId: string,
    playerCount: number,
  ) => { spyIndex: number; winner?: "spy" | "players" };
  recordSpyRound: (
    gameId: string,
    questionId: string,
    spyIndex: number,
    winner: "spy" | "players",
    playerCount: number,
  ) => void;
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

      initializeJustOneGame: (gameId, questionsOrCount) => {
        const { games } = get();
        if (games[gameId]) return;

        const total = Array.isArray(questionsOrCount)
          ? questionsOrCount.length
          : questionsOrCount;
        const allShuffled = shuffleArray(
          Array.from({ length: total }, (_, i) => i),
        );
        const questionOrder = allShuffled.slice(0, Math.min(13, total));
        const justOneReserveIndices = allShuffled.slice(Math.min(13, total));

        set({
          games: {
            ...games,
            [gameId]: {
              gameId,
              answers: {},
              questionOrder,
              justOneReserveIndices,
              currentIndex: 0,
            },
          },
        });
      },

      swapJustOneQuestion: (gameId, currentOrderIndex, totalQuestionsCount) => {
        const { games } = get();
        const game = games[gameId];
        if (!game) return null;

        let reserve = game.justOneReserveIndices ?? [];

        // Se a reserva estiver vazia mas houver mais questões no jogo, gera reserva a partir das não usadas
        if (reserve.length === 0 && totalQuestionsCount && totalQuestionsCount > 1) {
          const usedSet = new Set(game.questionOrder);
          const available = Array.from({ length: totalQuestionsCount }, (_, i) => i).filter(
            (i) => !usedSet.has(i),
          );
          reserve = shuffleArray(
            available.length > 0
              ? available
              : Array.from({ length: totalQuestionsCount }, (_, i) => i).filter(
                  (i) => i !== game.questionOrder[currentOrderIndex],
                ),
          );
        }

        if (reserve.length === 0) return null;

        const [newQIndex, ...remainingReserve] = reserve;
        const newQuestionOrder = [...game.questionOrder];
        newQuestionOrder[currentOrderIndex] = newQIndex;

        set((state) => ({
          games: {
            ...state.games,
            [gameId]: {
              ...game,
              questionOrder: newQuestionOrder,
              justOneReserveIndices: remainingReserve,
            },
          },
        }));

        return newQIndex;
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
                spyPlayerCount: undefined,
                spyScores: undefined,
                spyRounds: {},
                justOneReserveIndices: undefined,
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

      // ── Spy actions ───────────────────────────────────────────────

      setSpyConfig: (gameId, playerCount) =>
        set((state) => {
          const game = state.games[gameId];
          return {
            games: {
              ...state.games,
              [gameId]: {
                ...(game ?? {
                  gameId,
                  answers: {},
                  questionOrder: [],
                  currentIndex: 0,
                }),
                spyPlayerCount: playerCount,
                spyScores: Array(playerCount).fill(0),
                spyRounds: {},
              },
            },
          };
        }),

      getOrGenerateSpyRound: (gameId, questionId, playerCount) => {
        const { games } = get();
        const game = games[gameId];
        if (!game) return { spyIndex: 0 };
        const existing = game.spyRounds?.[questionId];
        if (existing) return existing;

        const spyIndex = Math.floor(Math.random() * playerCount);
        const newRound = { spyIndex };

        set((state) => {
          const currentGame = state.games[gameId];
          if (!currentGame) return state;
          return {
            games: {
              ...state.games,
              [gameId]: {
                ...currentGame,
                spyRounds: {
                  ...(currentGame.spyRounds ?? {}),
                  [questionId]: newRound,
                },
              },
            },
          };
        });

        return newRound;
      },

      recordSpyRound: (gameId, questionId, spyIndex, winner, playerCount) =>
        set((state) => {
          const game = state.games[gameId];
          if (!game) return state;

          const updatedRounds = {
            ...(game.spyRounds ?? {}),
            [questionId]: { spyIndex, winner },
          };

          // Recalcular pontuações acumuladas dos jogadores
          const newScores = Array(playerCount).fill(0);
          Object.values(updatedRounds).forEach((r) => {
            if (r.winner === "spy") {
              newScores[r.spyIndex] = (newScores[r.spyIndex] ?? 0) + 2;
            } else if (r.winner === "players") {
              for (let i = 0; i < playerCount; i++) {
                if (i !== r.spyIndex) {
                  newScores[i] = (newScores[i] ?? 0) + 1;
                }
              }
            }
          });

          const points = winner === "spy" ? 2 : 1;

          return {
            games: {
              ...state.games,
              [gameId]: {
                ...game,
                spyScores: newScores,
                spyRounds: updatedRounds,
                answers: {
                  ...game.answers,
                  [questionId]: {
                    questionId,
                    points,
                    isCorrect: true,
                  },
                },
              },
            },
          };
        }),
    }),
    {
      name: "game-answers-storage",
    },
  ),
);
