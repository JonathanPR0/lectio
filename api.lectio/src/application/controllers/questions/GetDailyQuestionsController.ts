import { Controller } from "@application/contracts/Controller";
import { GetDailyQuestionsByDateUseCase } from "@application/useCases/questions/GetDailyQuestionsByDateUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { getDailyQuestionByDateSchema } from "./schemas/getDailyQuestionByDateSchema";

@Injectable()
export class GetDailyQuestionsByDateController extends Controller<
  "public",
  GetDailyQuestionsByDateController.Response
> {
  constructor(private readonly getDailyQuestionsByDateUseCase: GetDailyQuestionsByDateUseCase) {
    super();
  }

  protected override async handle(
    request: Controller.Request<"public">
  ): Promise<Controller.Response<GetDailyQuestionsByDateController.Response>> {
    const { queryParams } = request;
    const { date } = getDailyQuestionByDateSchema.parse(queryParams);

    const dailyQuestions = await this.getDailyQuestionsByDateUseCase.execute({
      date: date ? new Date(date) : new Date(),
    });

    return {
      statusCode: 200,
      body: dailyQuestions,
    };
  }
}

export namespace GetDailyQuestionsByDateController {
  export type Params = {
    categoryId: string;
  };

  export type Request = Controller.Request<
    "private",
    Record<string, unknown>,
    GetDailyQuestionsByDateController.Params
  >;

  export type Response = GetDailyQuestionsByDateUseCase.Output;
}
