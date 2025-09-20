import { DailyQuestionsRepository } from "@infra/database/dynamo/repositories/DailyQuestionsRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { DailyQuestions } from "src/entities/DailyQuestions";

@Injectable()
export class CreateDailyQuestionsUseCase {
  constructor(private readonly dailyQuestionsRepository: DailyQuestionsRepository) {}

  async execute({
    date,
    questions,
  }: CreateDailyQuestionsUseCase.Input): Promise<CreateDailyQuestionsUseCase.Output> {
    const questionsAlreadyExists = await this.dailyQuestionsRepository.findByDate(date);
    if (questionsAlreadyExists) {
      return { dailyQuestionsId: questionsAlreadyExists.id };
    }
    const dailyQuestions = new DailyQuestions({ date, questions });
    await this.dailyQuestionsRepository.create(dailyQuestions);
    return { dailyQuestionsId: dailyQuestions.id };
  }
}

export namespace CreateDailyQuestionsUseCase {
  export type Input = {
    date: Date;
    questions: DailyQuestions.QuestionsType[];
  };

  export type Output = {
    dailyQuestionsId: string;
  };
}
