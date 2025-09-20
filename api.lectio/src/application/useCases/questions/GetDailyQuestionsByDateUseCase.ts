import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import { DailyQuestionsRepository } from "@infra/database/dynamo/repositories/DailyQuestionsRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { DailyQuestions } from "src/entities/DailyQuestions";

@Injectable()
export class GetDailyQuestionsByDateUseCase {
  constructor(private readonly dailyQuestionsRepository: DailyQuestionsRepository) {}

  async execute({
    date,
  }: GetDailyQuestionsByDateUseCase.Input): Promise<GetDailyQuestionsByDateUseCase.Output> {
    const dailyQuestions = await this.dailyQuestionsRepository.findByDate(date);
    if (!dailyQuestions) {
      throw new ResourceNotFound("Nenhuma questão diária encontrada para a data fornecida.");
    }

    return {
      id: dailyQuestions.id,
      date: dailyQuestions.date,
      questions: dailyQuestions.questions.map((q) => ({
        id: q.id,
        text: q.text,
        difficulty: q.difficulty,
        points: q.points,
        options: q.options,
      })),
    };
  }
}

export namespace GetDailyQuestionsByDateUseCase {
  export type Input = {
    date: Date;
  };

  export type Output = {
    id: string;
    date: Date;
    questions: {
      id: number;
      text: string;
      difficulty: DailyQuestions.Difficulty;
      points: number;
      options: string[];
    }[];
  };
}
