import { ErrorCode } from "@application/errors/ErrorCode";

interface ILambdaErrorResponse {
  statusCode: number;
  code: ErrorCode;
  message: any;
}
export function lambdaErrorResponse({ statusCode, code, message }: ILambdaErrorResponse) {
  return {
    statusCode,
    body: JSON.stringify({
      error: {
        code,
        message: typeof message === "object" ? JSON.stringify(message) : message,
      },
    }),
  };
}
