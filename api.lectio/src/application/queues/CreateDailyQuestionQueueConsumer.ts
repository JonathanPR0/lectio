import { IQueueConsumer } from "@application/contracts/IQueueConsumer";
import { CreateDailyQuestionsUseCase } from "@application/useCases/questions/CreateDailyQuestionsUseCase";
import { DailyQuestionsQueueGateway } from "@infra/gateways/DailyQuestionsQueueGateway";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class DailyQuestionQueueConsumer
  implements IQueueConsumer<DailyQuestionsQueueGateway.Message>
{
  constructor(private readonly createDailyQuestionUseCase: CreateDailyQuestionsUseCase) {}

  async process({ date, questions }: DailyQuestionsQueueGateway.Message): Promise<void> {
    await this.createDailyQuestionUseCase.execute({ date: new Date(date), questions });
  }
}
