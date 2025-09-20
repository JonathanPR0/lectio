import { Controller } from "@application/contracts/Controller";
import { SignUpUseCase } from "@application/useCases/auth/SignUpUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { SignUpBody, signUpSchema } from "./schemas/signUpSchema";

@Injectable()
@Schema(signUpSchema)
export class SignUpController extends Controller<"public", SignUpController.Response> {
  constructor(private readonly signUpUseCase: SignUpUseCase) {
    super();
  }
  protected override async handle(
    request: Controller.Request<"public", SignUpBody>
  ): Promise<Controller.Response<SignUpController.Response>> {
    const { email, username, password, points } = request.body;
    const { accessToken, refreshToken } = await this.signUpUseCase.execute({
      email,
      username,
      password,
      points,
    });
    return {
      statusCode: 201,
      body: {
        accessToken,
        refreshToken,
      },
    };
  }
}

export namespace SignUpController {
  export type Response = {
    accessToken: string;
    refreshToken: string;
  };
}
