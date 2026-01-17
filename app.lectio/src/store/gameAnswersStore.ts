// src/store/gameAnswersStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GameAnswer {
  questionId: string;
  answerIndex?: number; // Para opções
  answerBoolean?: boolean; // Para verdadeiro/falso
  isCorrect: boolean;
}

interface GameProgress {
  gameId: string;
  answers: Record<string, GameAnswer>;
  questionOrder: number[]; // Ordem aleatória das perguntas
  currentIndex: number; // Índice atual na ordem
  completedAt?: string;
}

interface GameAnswersState {
  games: Record<string, GameProgress>;

  // Ações
  initializeGame: (gameId: string, totalQuestions: number) => void;
  addGameAnswer: (gameId: string, answer: GameAnswer) => void;
  getGameProgress: (gameId: string) => GameProgress | null;
  getQuestionOrder: (gameId: string) => number[];
  getCurrentQuestionIndex: (gameId: string) => number;
  isQuestionAnswered: (gameId: string, questionId: string) => boolean;
  getQuestionAnswer: (gameId: string, questionId: string) => GameAnswer | null;
  calculateGameScore: (gameId: string) => { correct: number; total: number };
  goToNextQuestion: (gameId: string) => void;
  goToPreviousQuestion: (gameId: string) => void;
  resetGame: (gameId: string) => void;
}

// Função para embaralhar array (Fisher-Yates)
const shuffleArray = (array: number[]): number[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useGameAnswersStore = create<GameAnswersState>()(
  persist(
    (set, get) => ({
      games: {},

      initializeGame: (gameId, totalQuestions) => {
        const { games } = get();

        // Se o jogo já existe, não inicializa novamente
        if (games[gameId]) {
          return;
        }

        // Cria ordem aleatória das questões
        const questionOrder = shuffleArray(
          Array.from({ length: totalQuestions }, (_, i) => i),
        );

        set({
          games: {
            ...games,
            [gameId]: {
              gameId,
              answers: {},
              questionOrder,
              currentIndex: 0,
            },
          },
        });
      },

      addGameAnswer: (gameId, answer) =>
        set((state) => {
          const game = state.games[gameId];
          if (!game) return state;

          // Ensure only the current question is updated
          const updatedAnswers = {
            ...game.answers,
            [answer.questionId]: answer,
          };

          return {
            games: {
              ...state.games,
              [gameId]: {
                ...game,
                answers: updatedAnswers,
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

        if (!game) {
          return { correct: 0, total: 0 };
        }

        const answers = Object.values(game.answers);
        const correct = answers.filter((a) => a.isCorrect).length;
        const total = answers.length;

        return { correct, total };
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
          // Mantém a ordem das perguntas, mas reseta o progresso
          return {
            games: {
              ...state.games,
              [gameId]: {
                ...game,
                answers: {},
                currentIndex: 0,
                questionOrder,
                completedAt: undefined,
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
