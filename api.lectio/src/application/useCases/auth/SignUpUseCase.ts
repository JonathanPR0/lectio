import { EmailAlreadyInUse } from "@application/errors/application/EmailAlreadyInUse";
import { UsernameAlreadyInUse } from "@application/errors/application/UsernameAlreadyInUse";
import { AccountRepository } from "@infra/database/dynamo/repositories/AccountRepository";
import { ProfileRepository } from "@infra/database/dynamo/repositories/ProfileRepository";
import { SignUpUnitOfWork } from "@infra/database/dynamo/uow/SignUpUnitOfWork";
import { AuthGateway } from "@infra/gateways/AuthGateway";
import { Injectable } from "@kernel/decorators/Injectable";
import { subDays } from "date-fns";
import { Account } from "src/entities/Account";
import { Profile } from "src/entities/Profile";

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountRepository: AccountRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly signUpUow: SignUpUnitOfWork
  ) {}
  async execute({
    email,
    password,
    username,
    points = 0,
  }: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
    const emailAlreadyInUse = await this.accountRepository.findByEmail(email);
    if (emailAlreadyInUse) {
      throw new EmailAlreadyInUse();
    }
    const usernameAlreadyInUse = await this.profileRepository.findByUsername(username);
    if (usernameAlreadyInUse) {
      throw new UsernameAlreadyInUse();
    }

    const account = new Account({ email });
    const { externalId } = await this.authGateway.signUp({
      email,
      password,
      internalId: account.id,
    });

    const profile = new Profile({
      username,
      accountId: account.id,
      points: Math.min(points, 60),
      shields: 0,
      streakCount: points > 0 ? 1 : 0,
      lastActivityDate: points > 0 ? new Date() : subDays(new Date(), 1),
      lastAnswers: [],
    });

    try {
      account.externalId = externalId;
      await this.signUpUow.run({ account, profile });

      const { accessToken, refreshToken } = await this.authGateway.signIn({ email, password });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      await this.authGateway.deleteUser({ externalId });
      throw error;
    }
  }
}

export namespace SignUpUseCase {
  export type Input = {
    email: string;
    password: string;
    username: string;
    points?: number;
  };
  export type Output = {
    accessToken: string;
    refreshToken: string;
  };
}
