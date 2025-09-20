import { Injectable } from "@kernel/decorators/Injectable";
import { Account } from "src/entities/Account";
import { Profile } from "src/entities/Profile";
import { AccountRepository } from "../repositories/AccountRepository";
import { ProfileRepository } from "../repositories/ProfileRepository";
import { UnitOfWork } from "./UnitOfWork";

@Injectable()
export class SignUpUnitOfWork extends UnitOfWork {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly profileRepository: ProfileRepository
  ) {
    super();
  }

  async run({ account, profile }: SignUpUnitOfWork.RunParams): Promise<void> {
    this.addPut(this.accountRepository.getPutCommandInput(account));
    this.addPut(this.profileRepository.getPutCommandInput(profile));
    await this.commit();
  }
}

export namespace SignUpUnitOfWork {
  export type RunParams = {
    account: Account;
    profile: Profile;
  };
}
