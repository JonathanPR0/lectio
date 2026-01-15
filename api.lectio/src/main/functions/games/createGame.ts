import "reflect-metadata";

import { CreateGameController } from "@application/controllers/games/CreateGameController";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(CreateGameController);
