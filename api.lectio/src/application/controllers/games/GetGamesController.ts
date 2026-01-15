import { Controller } from "@application/contracts/Controller";
import { ListGamesQuery } from "@application/querys/ListGamesQuery";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class GetGamesController extends Controller<"public", GetGamesController.Response> {
  constructor(private readonly ListGamesQuery: ListGamesQuery) {
    super();
  }

  protected override async handle(): Promise<Controller.Response<GetGamesController.Response>> {
    const games = await this.ListGamesQuery.execute();

    return {
      statusCode: 200,
      body: games,
    };
  }
}

export namespace GetGamesController {
  export type Request = Controller.Request<"private", Record<string, unknown>>;
  export type Response = ListGamesQuery.Output;
}
