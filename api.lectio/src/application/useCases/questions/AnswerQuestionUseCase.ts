import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import { StreakService } from "@application/services/StreakService";
import { DailyQuestionsRepository } from "@infra/database/dynamo/repositories/DailyQuestionsRepository";
import { ProfileRepository } from "@infra/database/dynamo/repositories/ProfileRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { normalizeDate } from "utils/normalizers";

@Injectable()
export class AnswerQuestionUseCase {
  constructor(
    private readonly dailyQuestionsRepository: DailyQuestionsRepository,
    private readonly profileRepository: ProfileRepository
  ) {}

  async execute({
    idDailyQuestion,
    idQuestion,
    userAnswer,
    accountId,
  }: AnswerQuestionUseCase.Input): Promise<AnswerQuestionUseCase.Output> {
    const dailyQuestions = await this.dailyQuestionsRepository.findById(idDailyQuestion);
    if (!dailyQuestions) {
      throw new ResourceNotFound("Daily question not found");
    }
    const question = dailyQuestions.questions.find((q) => q.id === idQuestion);

    const response = {
      questionId: idQuestion,
      isCorrect: false,
      answer: question?.answer ?? "",
      correctOptionIndex: question?.correctOptionIndex ?? -1,
    };

    if (question?.options[question.correctOptionIndex]! == userAnswer) {
      response.isCorrect = true;
    }

    if (accountId) {
      let profile = await this.profileRepository.findByAccountId(accountId);
      if (!profile) {
        throw new ResourceNotFound("Profile not found");
      }

      // 1. Verifica se já respondeu essa pergunta hoje
      const alreadyAnswered = profile?.lastAnswers?.some(
        (a) => a.dailyQuestionsId === idDailyQuestion && a.questionId === idQuestion
      );

      // Não pontua novamente, apenas retorna a resposta
      if (alreadyAnswered) {
        return response;
      }

      const isNewDay = normalizeDate(profile.lastActivityDate) < normalizeDate(new Date());

      if (response.isCorrect) {
        profile.points += question?.points || 0;
        if (isNewDay) {
          profile.streakCount += 1;
        }
        profile.lastActivityDate = new Date();
      }

      // 2. Salva a resposta no histórico
      const userAnswerIndex = question?.options.findIndex((option) => option === userAnswer) ?? -1;
      const answerToSave = {
        dailyQuestionsId: idDailyQuestion,
        questionId: idQuestion,
        answeredAt: new Date(),
        userAnswerIndex,
        answer: question?.answer ?? "",
        answerIndex: question?.correctOptionIndex ?? -1,
      };

      profile?.lastAnswers?.push(answerToSave); // adiciona a nova resposta
      profile.lastAnswers = profile?.lastAnswers?.slice(-5); // mantém só as últimas 5 respostas

      if (!response.isCorrect) {
        // Conta quantas perguntas do dia já foram respondidas
        const answeredQuestionsCount = profile?.lastAnswers?.filter(
          (a) => a.dailyQuestionsId === idDailyQuestion
        ).length;

        // Conta quantas respostas corretas do dia foram dadas
        const correctAnswersCount = profile?.lastAnswers?.filter(
          (a) => a.dailyQuestionsId === idDailyQuestion && a.answerIndex === a.userAnswerIndex
        ).length;

        // Se errou, é um novo dia, todas as perguntas foram respondidas e nenhuma foi correta
        if (
          isNewDay &&
          answeredQuestionsCount === dailyQuestions.questions.length &&
          correctAnswersCount === 0
        ) {
          profile = StreakService.updateStreak(profile);
        }
      }

      await this.profileRepository.save(profile);
    }

    await this.dailyQuestionsRepository.create(dailyQuestions);
    return response;
  }
}

export namespace AnswerQuestionUseCase {
  export type Input = {
    idDailyQuestion: string;
    idQuestion: number;
    userAnswer: string;
    accountId?: string;
  };

  export type Output = {
    questionId: number;
    isCorrect: boolean;
    answer: string;
    correctOptionIndex: number;
  };
}
