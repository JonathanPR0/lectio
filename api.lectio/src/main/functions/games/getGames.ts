import "reflect-metadata";

import { GetGamesController } from "@application/controllers/games/GetGamesController";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(GetGamesController);
