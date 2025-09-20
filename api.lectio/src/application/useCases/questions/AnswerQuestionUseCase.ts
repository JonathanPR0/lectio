import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import { DailyQuestionsRepository } from "@infra/database/dynamo/repositories/DailyQuestionsRepository";
import { ProfileRepository } from "@infra/database/dynamo/repositories/ProfileRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { calculateDaysDifference } from "utils/calculate";
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
    };

    if (question?.options[question.correctOptionIndex]! === userAnswer) {
      response.isCorrect = true;
    }

    if (accountId) {
      const profile = await this.profileRepository.findByAccountId(accountId);
      if (!profile) {
        throw new ResourceNotFound("Profile not found");
      }

      // 1. Verifica se já respondeu essa pergunta hoje
      const alreadyAnswered = profile.lastAnswers?.some(
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
      } else {
        if (isNewDay) {
          const hasShield = profile.shields > 0;
          if (hasShield && profile.streakCount > 0) {
            const daysDifference = calculateDaysDifference(new Date(), profile.lastActivityDate);
            if (daysDifference <= profile.shields) {
              // NÃO zera a sequência
              profile.lastActivityDate = new Date();
            } else {
              // ZERA a sequência
              profile.streakCount = 0;
            }
            profile.shields = Math.max(0, profile.shields - daysDifference); // Decrementa com base na diferença de dias
          } else {
            profile.streakCount = 0;
          }
        }
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

      profile.lastAnswers?.push(answerToSave); // adiciona a nova resposta
      profile.lastAnswers = profile.lastAnswers?.slice(-5); // mantém só as últimas 5 respostas

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
  };
}
