import { Controller } from "@application/contracts/Controller";
import { BadRequest } from "@application/errors/http/BadRequest";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import {
  ConfirmForgotPasswordBody,
  confirmForgotPasswordSchema,
} from "./schemas/confirmForgotPasswordSchema";
import { ConfirmForgotPasswordUseCase } from "@application/useCases/auth/ConfirmForgotPasswordUseCase";

@Injectable()
@Schema(confirmForgotPasswordSchema)
export class ConfirmForgotPasswordController extends Controller<
  "public",
  ConfirmForgotPasswordController.Response
> {
  constructor(private readonly confirmForgotPasswordUseCase: ConfirmForgotPasswordUseCase) {
    super();
  }

  protected override async handle({
    body,
  }: Controller.Request<"public", ConfirmForgotPasswordBody>): Promise<
    Controller.Response<ConfirmForgotPasswordController.Response>
  > {
    try {
      const { confirmationCode, email, password } = body;

      await this.confirmForgotPasswordUseCase.execute({
        confirmationCode,
        email,
        password,
      });

      return {
        statusCode: 204,
      };
    } catch {
      throw new BadRequest("Failed. Try again.");
    }
  }
}

export namespace ConfirmForgotPasswordController {
  export type Response = null;
}
