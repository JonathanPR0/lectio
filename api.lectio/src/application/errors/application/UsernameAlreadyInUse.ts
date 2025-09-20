import { ErrorCode } from "../ErrorCode";
import { ApplicationError } from "./ApplicationError";

export class UsernameAlreadyInUse extends ApplicationError {
  public override statusCode = 409;
  public override code: ErrorCode;

  constructor() {
    super();
    this.name = "UsernameAlreadyInUse";
    this.message = "This username is already in use";
    this.code = ErrorCode.USERNAME_ALREADY_IN_USE;
  }
}
