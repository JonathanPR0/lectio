import { ErrorCode } from "../ErrorCode";
import { ApplicationError } from "./ApplicationError";

export class ValidationError extends ApplicationError {
  public override statusCode = 400;
  public override code = ErrorCode.VALIDATION;

  constructor(message?: string) {
    super();
    this.name = "ValidationError";
    this.message = message ?? "Validation failed";
  }
}
