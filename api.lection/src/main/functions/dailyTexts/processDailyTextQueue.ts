import "reflect-metadata";

import { lambdaSQSAdapter } from "@main/adapters/lambdaSQSAdapter";
import { DailyTextQueueConsumer } from "@application/queues/CreateDailyTextsQueueConsumer";

export const handler = lambdaSQSAdapter(DailyTextQueueConsumer);
