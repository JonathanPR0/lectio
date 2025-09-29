import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import { StreakService } from "@application/services/StreakService";
import { ProfileRepository } from "@infra/database/dynamo/repositories/ProfileRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { differenceInHours } from "date-fns";
import { Profile } from "src/entities/Profile";

@Injectable()
export class GetProfileByAccountIdUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute({
    accountId,
  }: GetProfileByAccountIdUseCase.Input): Promise<GetProfileByAccountIdUseCase.Output> {
    let profile = await this.profileRepository.findByAccountId(accountId);
    if (!profile) {
      throw new ResourceNotFound("Category not found.");
    }

    // Calcula a diferença de dias desde a última atividade
    const hoursDifference = differenceInHours(new Date(), profile.lastActivityDate);

    if (hoursDifference >= 24 && profile.streakCount > 0) {
      profile = StreakService.updateStreak(profile);
      await this.profileRepository.save(profile);
    }

    return { profile };
  }
}

export namespace GetProfileByAccountIdUseCase {
  export type Input = {
    accountId: string;
  };

  export type Output = {
    profile: Profile;
  };
}
