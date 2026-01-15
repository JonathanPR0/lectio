import "reflect-metadata";

import { GetGameByIdController } from "@application/controllers/games/GetGamesByIdController";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(GetGameByIdController);
