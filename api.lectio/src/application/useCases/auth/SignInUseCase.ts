import { ProfileRepository } from "@infra/database/dynamo/repositories/ProfileRepository";
import { AuthGateway } from "@infra/gateways/AuthGateway";
import { Injectable } from "@kernel/decorators/Injectable";
import { differenceInDays } from "date-fns";

@Injectable()
export class SignInUseCase {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly profileRepository: ProfileRepository
  ) {}
  async execute({
    email,
    password,
    points = 0,
  }: SignInUseCase.Input): Promise<SignInUseCase.Output> {
    const { accessToken, refreshToken, internalId } = await this.authGateway.signIn({
      email,
      password,
    });

    if (points > 0) {
      const profile = await this.profileRepository.findByAccountId(internalId);
      const lastActivityDateWasToday = profile?.lastActivityDate
        ? differenceInDays(new Date(), profile.lastActivityDate) === 0
        : false;

      if (profile && !lastActivityDateWasToday) {
        profile.points += Math.min(points, 60);
        profile.streakCount += 1;
        profile.lastActivityDate = new Date();

        await this.profileRepository.save(profile);
      }
    }
    return {
      accessToken,
      refreshToken,
    };
  }
}

export namespace SignInUseCase {
  export type Input = {
    email: string;
    password: string;
    points?: number;
  };
  export type Output = {
    accessToken: string;
    refreshToken: string;
  };
}
