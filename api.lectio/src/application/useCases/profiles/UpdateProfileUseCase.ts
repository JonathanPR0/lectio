import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import { ProfileRepository } from "@infra/database/dynamo/repositories/ProfileRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class UpdateProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute({
    accountId,
    username,
  }: UpdateProfileUseCase.Input): Promise<UpdateProfileUseCase.Output> {
    const profile = await this.profileRepository.findByAccountId(accountId);

    if (!profile) {
      throw new ResourceNotFound("Profile not found.");
    }

    profile.username = username;

    await this.profileRepository.save(profile);
  }
}

export namespace UpdateProfileUseCase {
  export type Input = {
    accountId: string;
    username: string;
  };

  export type Output = void;
}
