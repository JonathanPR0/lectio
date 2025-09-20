import { Controller } from "@application/contracts/Controller";
import { ForgotPasswordUseCase } from "@application/useCases/auth/ForgotPasswordUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { ForgotPasswordBody, forgotPasswordSchema } from "./schemas/forgotPasswordSchema";

@Injectable()
@Schema(forgotPasswordSchema)
export class ForgotPasswordController extends Controller<
  "public",
  ForgotPasswordController.Response
> {
  constructor(private readonly forgotPasswordUseCase: ForgotPasswordUseCase) {
    super();
  }
  protected override async handle(
    request: Controller.Request<"public", ForgotPasswordBody>
  ): Promise<Controller.Response<ForgotPasswordController.Response>> {
    try {
      const { email } = request.body;
      await this.forgotPasswordUseCase.execute({
        email,
      });
      return {
        statusCode: 204,
      };
    } catch {
      // throw new BadRequest("Failed to send forgot password email");
    }
    return {
      statusCode: 204,
    };
  }
}

export namespace ForgotPasswordController {
  export type Response = null;
}
