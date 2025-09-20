import "reflect-metadata";

import { ScrapMonthDailyTextsController } from "@application/controllers/dailyTexts/ScrapMonthDailyTextsController";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(ScrapMonthDailyTextsController);
