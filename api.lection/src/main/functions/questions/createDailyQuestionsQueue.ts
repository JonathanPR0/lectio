import "reflect-metadata";

import { DailyQuestionQueueConsumer } from "@application/queues/CreateDailyQuestionQueueConsumer";
import { lambdaSQSAdapter } from "@main/adapters/lambdaSQSAdapter";

export const handler = lambdaSQSAdapter(DailyQuestionQueueConsumer);
