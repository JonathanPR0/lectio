import "reflect-metadata";

import { BuyShieldController } from "@application/controllers/profiles/BuyShieldController";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(BuyShieldController);
