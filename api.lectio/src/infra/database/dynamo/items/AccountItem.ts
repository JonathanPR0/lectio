import { Account } from "src/entities/Account";
import { normalizeUTCDate } from "utils/normalizers";

export class AccountItem {
  static readonly entityType = "Account";
  private readonly keys: AccountItem.Keys;
  constructor(private readonly attrs: AccountItem.Attrsibutes) {
    this.keys = {
      PK: AccountItem.getPK(attrs.id),
      SK: AccountItem.getSK(),
      GSI1PK: AccountItem.getGSI1PK(attrs.email),
      GSI1SK: AccountItem.getGSI1SK(),
    };
  }
  static fromEntity(account: Account): AccountItem {
    return new AccountItem({
      ...account,
      createdAt: normalizeUTCDate(account.createdAt).toISOString(),
    });
  }
  static toEntity(accountItem: AccountItem.ItemType): Account {
    return new Account({
      id: accountItem.id,
      email: accountItem.email,
      externalId: accountItem.externalId,
      createdAt: new Date(accountItem.createdAt),
    });
  }
  toItem(): AccountItem.ItemType {
    return {
      entityType: AccountItem.entityType,
      ...this.attrs,
      ...this.keys,
    };
  }
  static getPK(id: string): AccountItem.Keys["PK"] {
    return `ACCOUNT#${id}`;
  }
  static getSK(): AccountItem.Keys["SK"] {
    return `ACCOUNT`;
  }
  static getGSI1PK(email: string): AccountItem.Keys["GSI1PK"] {
    return `ACCOUNT#${email}`;
  }
  static getGSI1SK(): AccountItem.Keys["GSI1SK"] {
    return `ACCOUNT`;
  }
}

export namespace AccountItem {
  export type Attrsibutes = {
    id: string;
    email: string;
    externalId: string | undefined;
    createdAt: string;
  };

  export type Keys = {
    PK: `ACCOUNT#${string}`;
    SK: `ACCOUNT`;
    GSI1PK: `ACCOUNT#${string}`;
    GSI1SK: `ACCOUNT`;
  };
  export type ItemType = Attrsibutes & Keys & { entityType: "Account" };
}
