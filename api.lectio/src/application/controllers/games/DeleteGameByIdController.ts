import { Controller } from "@application/contracts/Controller";
import { DeleteGameByIdUseCase } from "@application/useCases/games/DeleteGameByIdUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { deleteGameByIdSchema } from "./schemas/deleteGameByIdSchema";

@Injectable()
export class DeleteGameByIdController extends Controller<"private", undefined> {
  constructor(private readonly deleteGameByIdUseCase: DeleteGameByIdUseCase) {
    super();
  }

  protected override async handle({
    params,
  }: DeleteGameByIdController.Request): Promise<Controller.Response<undefined>> {
    const { gameId } = deleteGameByIdSchema.parse(params);

    await this.deleteGameByIdUseCase.execute({ id: gameId });

    return {
      statusCode: 204,
    };
  }
}

export namespace DeleteGameByIdController {
  export type Params = {
    gameId: string;
  };

  export type Request = Controller.Request<"private", Record<string, unknown>, Params>;
}
