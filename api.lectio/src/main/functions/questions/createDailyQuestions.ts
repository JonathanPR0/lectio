import "reflect-metadata";

import { CreateDailyQuestionsController } from "@application/controllers/questions/CreateDailyQuestionsController";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(CreateDailyQuestionsController);
