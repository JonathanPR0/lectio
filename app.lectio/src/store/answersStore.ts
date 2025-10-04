// src/store/answersStore.ts
import { storageKeys } from "@/config/storageKeys";
import { getCurrentDateTimeInBrazil } from "@/utils/getCurrentDateTimeInBrazil";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AnswerResponse {
  questionId: number;
  answerIndex: number;
  isCorrect: boolean;
  correctOptionIndex: number;
  answer: string; // Resposta explicativa retornada pelo servidor
}

interface AnswersState {
  date: string;
  answers: Record<number, AnswerResponse>;
  idDailyQuestion: string | null;

  // Ações
  setDailyQuestion: (id: string) => void;
  addAnswer: (answer: AnswerResponse) => void;
  setAnswers: (answers: AnswerResponse[]) => void;
  resetIfNewDay: () => void;
  getQuestionAnswer: (questionId: number) => AnswerResponse | null;
  isQuestionAnswered: (questionId: number) => boolean;
  calculateScore: (questions: Array<{ id: number; points: number }>) => number;
}

// Verificar se a data armazenada é de hoje
const isToday = (dateString: string): boolean => {
  const today = getCurrentDateTimeInBrazil().toString().split("T")[0];
  const storedDate = new Date(dateString).toString().split("T")[0];
  return today === storedDate;
};

export const useAnswersStore = create<AnswersState>()(
  persist(
    (set, get) => ({
      date: getCurrentDateTimeInBrazil().toString(),
      answers: {},
      idDailyQuestion: null,

      setDailyQuestion: (id) => set({ idDailyQuestion: id }),

      addAnswer: (answer) =>
        set((state) => {
          // Verifica se a data do store é de hoje
          if (!isToday(state.date)) {
            // Se não for hoje, reseta completamente
            return {
              date: getCurrentDateTimeInBrazil().toString(),
              answers: { [answer.questionId]: answer }, // Começa novo objeto apenas com a resposta atual
              idDailyQuestion: state.idDailyQuestion, // Mantém o ID da questão diária
            };
          }

          // A data do store é de hoje, mas pode haver respostas antigas
          // Vamos manter as respostas existentes e adicionar/atualizar a nova
          return {
            answers: {
              ...state.answers,
              [answer.questionId]: answer,
            },
          };
        }),

      setAnswers: (answers) =>
        set(() => {
          const answersMap: Record<number, AnswerResponse> = {};

          // Converte o array de respostas para um objeto com questionId como chave
          answers.forEach((answer) => {
            answersMap[answer.questionId] = answer;
          });

          return {
            answers: answersMap,
          };
        }),

      resetIfNewDay: () => {
        const { date } = get();
        if (!isToday(date)) {
          set({
            date: getCurrentDateTimeInBrazil().toString(),
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
