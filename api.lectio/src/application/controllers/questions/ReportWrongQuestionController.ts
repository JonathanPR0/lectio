import { Controller } from "@application/contracts/Controller";
import { ReportWrongQuestionUseCase } from "@application/useCases/questions/ReportWrongQuestionUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import {
  ReportWrongQuestionBody,
  reportWrongQuestionSchema,
} from "./schemas/reportWrongQuestionSchema";

@Injectable()
@Schema(reportWrongQuestionSchema)
export class ReportWrongQuestionController extends Controller<
  "public",
  reportWrongQuestionController.Response
> {
  constructor(private readonly reportWrongQuestionUseCase: ReportWrongQuestionUseCase) {
    super();
  }

  protected override async handle({
    body,
    accountId,
  }: Controller.Request<"public", ReportWrongQuestionBody>): Promise<
    Controller.Response<reportWrongQuestionController.Response>
  > {
    const { idDailyQuestion, idQuestion, reportTitle, reportSubject } = body;

    const response = await this.reportWrongQuestionUseCase.execute({
      idDailyQuestion,
      idQuestion,
      reportTitle,
      reportSubject,
      accountId: accountId || undefined,
    });

    return {
      statusCode: 201,
      body: response,
    };
  }
}

export namespace reportWrongQuestionController {
  export type Response = ReportWrongQuestionUseCase.Output;
}
