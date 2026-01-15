import { Controller } from "@application/contracts/Controller";
import { CreateGameUseCase } from "@application/useCases/games/CreateGameUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { CreateGameBody, createGameSchema } from "./schemas/createGameSchema";

@Injectable()
@Schema(createGameSchema)
export class CreateGameController extends Controller<"private", CreateGameController.Response> {
  constructor(private readonly createGameUseCase: CreateGameUseCase) {
    super();
  }

  protected override async handle({
    body,
  }: Controller.Request<"private", CreateGameBody>): Promise<
    Controller.Response<CreateGameController.Response>
  > {
    const { name, type, questions } = body;

    const { gameId } = await this.createGameUseCase.execute({
      name,
      type,
      questions,
    });

    return {
      statusCode: 201,
      body: {
        gameId,
      },
    };
  }
}

export namespace CreateGameController {
  export type Response = {
    gameId: string;
  };
}
