// src/store/answersStore.ts
import { storageKeys } from "@/config/storageKeys";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AnswerResponse {
  questionId: number;
  isCorrect: boolean;
  answer: string; // Resposta explicativa retornada pelo servidor
}

interface AnswersState {
  date: string;
  answers: Record<number, AnswerResponse>;
  idDailyQuestion: string | null;

  // Ações
  setDailyQuestion: (id: string) => void;
  addAnswer: (answer: AnswerResponse) => void;
  resetIfNewDay: () => void;
  getQuestionAnswer: (questionId: number) => AnswerResponse | null;
  isQuestionAnswered: (questionId: number) => boolean;
  calculateScore: (questions: Array<{ id: number; points: number }>) => number;
}

// Verificar se a data armazenada é de hoje
const isToday = (dateString: string): boolean => {
  const today = new Date().toISOString().split("T")[0];
  const storedDate = new Date(dateString).toISOString().split("T")[0];
  return today === storedDate;
};

export const useAnswersStore = create<AnswersState>()(
  persist(
    (set, get) => ({
      date: new Date().toISOString(),
      answers: {},
      idDailyQuestion: null,

      setDailyQuestion: (id) => set({ idDailyQuestion: id }),

      addAnswer: (answer) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [answer.questionId]: answer,
          },
        })),

      resetIfNewDay: () => {
        const { date } = get();
        if (!isToday(date)) {
          set({
            date: new Date().toISOString(),
            answers: {},
            idDailyQuestion: null,
          });
        }
      },

      getQuestionAnswer: (questionId) => {
        const { answers } = get();
        return answers[questionId] || null;
      },

      isQuestionAnswered: (questionId) => {
        const { answers } = get();
        return !!answers[questionId];
      },

      calculateScore: (questions) => {
        const { answers } = get();

        return questions.reduce((total, question) => {
          const answer = answers[question.id];
          if (answer?.isCorrect) {
            return total + question.points;
          }
          return total;
        }, 0);
      },
    }),
    {
      name: storageKeys.DAILY_ANSWERS,
    },
  ),
);
