import { Controller } from "@application/contracts/Controller";
import { DailyQuestionsQueueGateway } from "@infra/gateways/DailyQuestionsQueueGateway";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import {
  CreateDailyQuestionsBody,
  createDailyQuestionsSchema,
} from "./schemas/createDailyQuestionsSchema";

@Injectable()
@Schema(createDailyQuestionsSchema)
export class CreateDailyQuestionsController extends Controller<
  "private",
  CreateDailyQuestionsController.Response
> {
  constructor(private readonly dailyQuestionsQueueGateway: DailyQuestionsQueueGateway) {
    super();
  }

  protected override async handle({
    body,
  }: Controller.Request<"private", CreateDailyQuestionsBody>): Promise<
    Controller.Response<CreateDailyQuestionsController.Response>
  > {
    const { date, questions } = body;

    await this.dailyQuestionsQueueGateway.publish({
      date: new Date(date),
      questions,
    });

    return {
      statusCode: 201,
      body: undefined,
    };
  }
}

export namespace CreateDailyQuestionsController {
  export type Response = void;
}
