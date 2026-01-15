import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import { GamesRepository } from "@infra/database/dynamo/repositories/GamesRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { Games } from "src/entities/Games";

@Injectable()
export class GetGameByIdUseCase {
  constructor(private readonly gameRepository: GamesRepository) {}

  async execute({ id }: GetGameByIdUseCase.Input): Promise<GetGameByIdUseCase.Output> {
    const game = await this.gameRepository.findById(id);
    if (!game) {
      throw new ResourceNotFound("Nenhum jogo encontrado para o id fornecido.");
    }

    return {
      id: game.id,
      name: game.name,
      type: game.type,
      questions: game.questions.map((q) => ({
        id: q.id,
        text: q.text,
        difficulty: q.difficulty,
        options: q.options,
        answer: q.answer,
      })),
    };
  }
}

export namespace GetGameByIdUseCase {
  export type Input = {
    id: string;
  };

  export type Output = {
    id: string;
    name: string;
    type: Games.Type;
    questions: {
      id?: string;
      text: string;
      difficulty: Games.Difficulty | null;
      options: Games.OptionsType[];
      answer: string;
    }[];
  };
}
