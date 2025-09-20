import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import { ValidationError } from "@application/errors/application/ValidationError";
import { ProfileRepository } from "@infra/database/dynamo/repositories/ProfileRepository";
import { Injectable } from "@kernel/decorators/Injectable";

const SHIELD_COST = 100;

@Injectable()
export class BuyShieldUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute({ accountId }: BuyShieldUseCase.Input): Promise<BuyShieldUseCase.Output> {
    const profile = await this.profileRepository.findByAccountId(accountId);

    if (!profile) {
      throw new ResourceNotFound("Profile not found.");
    }

    if (profile.points < SHIELD_COST) {
      throw new ValidationError("Sem pontos suficientes para comprar um escudo.");
    }

    profile.points -= SHIELD_COST;
    profile.shields += 1;
    if (profile.shields > 2) {
      throw new ValidationError("Você já possui o número máximo de escudos.");
    }

    await this.profileRepository.save(profile);
  }
}

export namespace BuyShieldUseCase {
  export type Input = {
    accountId: string;
  };

  export type Output = void;
}
