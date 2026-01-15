import { Controller } from "@application/contracts/Controller";
import { GetGameByIdUseCase } from "@application/useCases/games/GetGameByIdUseCase";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class GetGameByIdController extends Controller<"public", GetGameByIdController.Response> {
  constructor(private readonly getGameByIdUseCase: GetGameByIdUseCase) {
    super();
  }

  protected override async handle({
    params,
  }: GetGameByIdController.Request): Promise<Controller.Response<GetGameByIdController.Response>> {
    const { gameId } = params;

    const game = await this.getGameByIdUseCase.execute({
      id: gameId,
    });

    return {
      statusCode: 200,
      body: game,
    };
  }
}

export namespace GetGameByIdController {
  export type Params = {
    gameId: string;
  };

  export type Request = Controller.Request<
    "private",
    Record<string, unknown>,
    GetGameByIdController.Params
  >;

  export type Response = GetGameByIdUseCase.Output;
}
