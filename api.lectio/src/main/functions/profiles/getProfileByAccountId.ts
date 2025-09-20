import "reflect-metadata";

import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { GetProfileByAccountIdController } from "@application/controllers/profiles/GetProfileByAccountIdController";

export const handler = lambdaHttpAdapter(GetProfileByAccountIdController);
