import { Controller } from "@application/contracts/Controller";
import { GetProfileByAccountIdUseCase } from "@application/useCases/profiles/GetProfileByAccountIdUseCase";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class GetProfileByAccountIdController extends Controller<
  "private",
  GetProfileByAccountIdController.Response
> {
  constructor(private readonly getProfileByAccountIdUseCase: GetProfileByAccountIdUseCase) {
    super();
  }

  protected override async handle({
    accountId,
  }: GetProfileByAccountIdController.Request): Promise<
    Controller.Response<GetProfileByAccountIdController.Response>
  > {
    const profile = await this.getProfileByAccountIdUseCase.execute({
      accountId,
    });

    return {
      statusCode: 200,
      body: profile,
    };
  }
}

export namespace GetProfileByAccountIdController {
  export type Params = {
    categoryId: string;
  };

  export type Request = Controller.Request<
    "private",
    Record<string, unknown>,
    GetProfileByAccountIdController.Params
  >;

  export type Response = GetProfileByAccountIdUseCase.Output;
}
