import "reflect-metadata";

import { ReportWrongQuestionController } from "@application/controllers/questions/ReportWrongQuestionController";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(ReportWrongQuestionController);
