import "reflect-metadata";

import { DeleteGameByIdController } from "@application/controllers/games/DeleteGameByIdController";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(DeleteGameByIdController);
