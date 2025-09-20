import { Controller } from "@application/contracts/Controller";
import { BuyShieldUseCase } from "@application/useCases/profiles/BuyShieldUseCase";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class BuyShieldController extends Controller<"private", BuyShieldController.Response> {
  constructor(private readonly buyShieldUseCase: BuyShieldUseCase) {
    super();
  }

  protected override async handle({
    accountId,
  }: Controller.Request<"private">): Promise<Controller.Response<BuyShieldController.Response>> {
    await this.buyShieldUseCase.execute({
      accountId,
    });

    return {
      statusCode: 204,
    };
  }
}

export namespace BuyShieldController {
  export type Response = null;
}
