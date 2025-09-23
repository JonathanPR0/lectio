import { QuestionsAIGateway } from "@infra/ai/gateways/QuestionsAIGateway";
import { DailyQuestionsRepository } from "@infra/database/dynamo/repositories/DailyQuestionsRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { DailyText } from "scripts/scrape";
import { DailyQuestions } from "src/entities/DailyQuestions";

@Injectable()
export class ProcessDailyTextUseCase {
  constructor(
    private readonly dailyQuestionsRepository: DailyQuestionsRepository,
    private readonly questionsAIGateway: QuestionsAIGateway
  ) {}

  async execute({
    dailyText,
  }: ProcessDailyTextUseCase.Input): Promise<ProcessDailyTextUseCase.Output> {
    let dailyQuestions = await this.dailyQuestionsRepository.findByDate(new Date(dailyText.date));

    if (dailyQuestions && dailyQuestions.questions.length > 0) {
      return;
    }

    if (!dailyQuestions) {
      dailyQuestions = new DailyQuestions({
        date: new Date(dailyText.date),
        questions: [],
      });
      await this.dailyQuestionsRepository.create(dailyQuestions);
    }

    // Processa as perguntas do texto diário
    const { questions } = await this.questionsAIGateway.processQuestionsAI(dailyText);

    // Atualiza a entrada de DailyQuestions com as perguntas geradas
    dailyQuestions.questions = questions;

    await this.dailyQuestionsRepository.save(dailyQuestions);
  }
}

export namespace ProcessDailyTextUseCase {
  export type Input = { dailyText: DailyText };

  export type Output = void;
}
