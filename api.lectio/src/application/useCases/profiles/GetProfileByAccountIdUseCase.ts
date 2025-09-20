import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import { ProfileRepository } from "@infra/database/dynamo/repositories/ProfileRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { Profile } from "src/entities/Profile";

@Injectable()
export class GetProfileByAccountIdUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute({
    accountId,
  }: GetProfileByAccountIdUseCase.Input): Promise<GetProfileByAccountIdUseCase.Output> {
    const profile = await this.profileRepository.findByAccountId(accountId);
    if (!profile) {
      throw new ResourceNotFound("Category not found.");
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
