import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import { GamesRepository } from "@infra/database/dynamo/repositories/GamesRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class DeleteGameByIdUseCase {
  constructor(private readonly gamesRepository: GamesRepository) {}

  async execute({ id }: DeleteGameByIdUseCase.Input): Promise<void> {
    const game = await this.gamesRepository.findById(id);

    if (!game) {
      throw new ResourceNotFound("Nenhum jogo encontrado para o id fornecido.");
    }

    await this.gamesRepository.delete(id);
  }
}

export namespace DeleteGameByIdUseCase {
  export type Input = {
    id: string;
  };
}
