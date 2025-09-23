import { Controller } from "@application/contracts/Controller";
import { ScrapMonthDailyTextsUseCase } from "@application/useCases/dailyTexts/ScrapMonthDailyTextsUseCase";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class ScrapMonthDailyTextsController extends Controller<
  "private",
  ScrapMonthDailyTextsController.Response
> {
  constructor(private readonly scrapMonthDailyTextsUseCase: ScrapMonthDailyTextsUseCase) {
    super();
  }

  protected override async handle({}: Controller.Request<"private">): Promise<
    Controller.Response<ScrapMonthDailyTextsController.Response>
  > {
    await this.scrapMonthDailyTextsUseCase.execute();

    return {
      statusCode: 204,
    };
  }
}

export namespace ScrapMonthDailyTextsController {
  export type Response = null;
}
