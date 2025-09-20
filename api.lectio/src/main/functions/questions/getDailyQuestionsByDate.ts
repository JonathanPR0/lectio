import "reflect-metadata";

import { GetDailyQuestionsByDateController } from "@application/controllers/questions/GetDailyQuestionsController";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(GetDailyQuestionsByDateController);
