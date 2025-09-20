import { IQueueConsumer } from "@application/contracts/IQueueConsumer";
import { ProcessDailyTextUseCase } from "@application/useCases/dailyTexts/ProcessDailyTextsUseCase";
import { DailyTextsQueueGateway } from "@infra/gateways/DailyTextsQueueGateway";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class DailyTextQueueConsumer implements IQueueConsumer<DailyTextsQueueGateway.Message> {
  constructor(private readonly processDailyTextUseCase: ProcessDailyTextUseCase) {}

  async process({ dailyText }: DailyTextsQueueGateway.Message): Promise<void> {
    await this.processDailyTextUseCase.execute({ dailyText });
  }
}
