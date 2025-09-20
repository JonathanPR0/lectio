import "reflect-metadata";

import { AnswerQuestionController } from "@application/controllers/questions/AnswerQuestionController";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(AnswerQuestionController);
