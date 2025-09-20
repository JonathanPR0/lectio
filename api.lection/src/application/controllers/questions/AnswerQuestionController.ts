import { Controller } from "@application/contracts/Controller";
import { AnswerQuestionUseCase } from "@application/useCases/questions/AnswerQuestionUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { AnswerQuestionBody, answerQuestionSchema } from "./schemas/answerQuestionSchema";

@Injectable()
@Schema(answerQuestionSchema)
export class AnswerQuestionController extends Controller<
  "public",
  answerQuestionController.Response
> {
  constructor(private readonly answerQuestionUseCase: AnswerQuestionUseCase) {
    super();
  }

  protected override async handle({
    body,
    accountId,
  }: Controller.Request<"public", AnswerQuestionBody>): Promise<
    Controller.Response<answerQuestionController.Response>
  > {
    const { idDailyQuestion, idQuestion, userAnswer } = body;

    const response = await this.answerQuestionUseCase.execute({
      idDailyQuestion,
      idQuestion,
      userAnswer,
      accountId: accountId || undefined,
    });

    return {
      statusCode: 201,
      body: response,
    };
  }
}

export namespace answerQuestionController {
  export type Response = AnswerQuestionUseCase.Output;
}
