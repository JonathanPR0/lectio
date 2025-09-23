// src/hooks/useQuestions.ts
import { httpClient } from "@/services/httpClient";
import { useAnswersStore, type AnswerResponse } from "@/store/answersStore";
import { getCurrentDateTimeInBrazil } from "@/utils/getCurrentDateTimeInBrazil";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect } from "react";

export interface Question {
  id: number;
  text: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  options: string[];
}

export interface QuestionsResponse {
  id: string;
  date: string;
  questions: Question[];
}

export interface AnswerRequest {
  idDailyQuestion: string;
  idQuestion: number;
  userAnswer: string; // A opção selecionada pelo usuário (índice como string)
}

export function useQuestions() {
  const queryClient = useQueryClient();

  // Acessar a store de respostas
  const {
    resetIfNewDay,
    addAnswer,
    setDailyQuestion,
    idDailyQuestion,
    answers,
    isQuestionAnswered,
    getQuestionAnswer,
    calculateScore,
  } = useAnswersStore();

  // Verificar se precisa resetar as respostas ao inicializar
  useEffect(() => {
    resetIfNewDay();
  }, [resetIfNewDay]);

  // Buscar as questões do dia
  const { data, isLoading, error } = useQuery<QuestionsResponse>({
    queryKey: ["questions"],
    queryFn: async () => {
      const response = await httpClient.get<QuestionsResponse>("/questions", {
        params: {
          date: format(getCurrentDateTimeInBrazil(), "yyyy-MM-dd"),
        },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 1 hora
    // onSuccess is supported as an option in recent versions of React Query
    onSuccess: (data: QuestionsResponse) => {
      // Salvar o ID da questão diária se ainda não estiver salvo
      if (!idDailyQuestion) {
        setDailyQuestion(data.id);
      }
    },
  } as any);

  // Mutação para enviar resposta
  const answerMutation = useMutation({
    mutationFn: async ({
      questionId,
      optionText,
      optionIndex,
    }: {
      questionId: number;
      optionText: string;
      optionIndex: number;
    }) => {
      // Garantir que temos o ID da questão diária
      if (!idDailyQuestion && data) {
        setDailyQuestion(data.id);
      }

      const response = await httpClient.put<AnswerResponse>(
        "/questions/answer",
        {
          idDailyQuestion: idDailyQuestion || data?.id,
          idQuestion: questionId,
          userAnswer: optionText,
        } as AnswerRequest,
      );

      return {
        ...response.data,
        questionId,
        answerIndex: optionIndex,
      };
    },
    onSuccess: (responseData) => {
      // Salvar resposta na store
      addAnswer(responseData);

      // Invalidar queries relevantes para forçar atualização
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // Função para responder uma pergunta
  const answerQuestion = (
    questionId: number,
    optionText: string,
    optionIndex: number,
  ) => {
    return answerMutation.mutate({ questionId, optionText, optionIndex });
  };

  // Calcular a pontuação atual
  const getCurrentScore = (): number => {
    if (!data?.questions) return 0;
    return calculateScore(data.questions);
  };

  // Total de pontos possíveis
  const getTotalPossiblePoints = (): number => {
    if (!data?.questions) return 0;
    return data.questions.reduce((total, q) => total + q.points, 0);
  };

  // Calcular o progresso
  const getProgress = (): number => {
    if (!data?.questions) return 0;
    return (Object.keys(answers).length / data.questions.length) * 100;
  };

  return {
    data, // Dados das questões
    isLoading, // Estado de carregamento das questões
    error, // Erro ao carregar questões

    // Funções relacionadas às respostas
    answerQuestion,
    isAnswering: answerMutation.isPending,
    answerError: answerMutation.error,
    isQuestionAnswered,
    getQuestionAnswer,

    // Métricas
    getCurrentScore,
    getTotalPossiblePoints,
    getProgress,

    // Dados das respostas
    answers,
    dailyQuestionId: idDailyQuestion,
  };
}
