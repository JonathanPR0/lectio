import { GamesRepository } from "@infra/database/dynamo/repositories/GamesRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { Games } from "src/entities/Games";

@Injectable()
export class CreateGameUseCase {
  constructor(private readonly gamesRepository: GamesRepository) {}

  async execute({
    name,
    type,
    questions,
  }: CreateGameUseCase.Input): Promise<CreateGameUseCase.Output> {
    const questionsAlreadyExists = await this.gamesRepository.findByName(name);
    if (questionsAlreadyExists) {
      return { gameId: questionsAlreadyExists.id };
    }
    const games = new Games({ name, type, questions });
    await this.gamesRepository.create(games);
    return { gameId: games.id };
  }
}

export namespace CreateGameUseCase {
  export type Input = {
    name: string;
    type: Games.Type;
    questions: Games.QuestionsType[];
  };

  export type Output = {
    gameId: string;
  };
}
