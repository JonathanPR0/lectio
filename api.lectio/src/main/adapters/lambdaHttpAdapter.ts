import { Controller } from "@application/contracts/Controller";
import { ApplicationError } from "@application/errors/application/ApplicationError";
import { ErrorCode } from "@application/errors/ErrorCode";
import { HttpError } from "@application/errors/http/HttpError";
import { Registry } from "@kernel/di/Registry";
import lambdaBodyParser from "@main/utils/lambdaBodyParser";
import { lambdaErrorResponse } from "@main/utils/lambdaErrorResponse";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { Constructor } from "src/shared/types/Contructor";
import { ZodError } from "zod";

type Event = APIGatewayProxyEventV2 | APIGatewayProxyEventV2WithJWTAuthorizer;

export function lambdaHttpAdapter(controllerImpl: Constructor<Controller<any, unknown>>) {
  return async (event: Event): Promise<APIGatewayProxyResultV2> => {
    try {
      const controller = Registry.getInstance().resolve(controllerImpl);

      const body = lambdaBodyParser(event.body);
      const params = event.pathParameters || {};
      const queryParams = event.queryStringParameters || {};

      const accountId =
        event.requestContext && "authorizer" in event.requestContext
          ? (event.requestContext.authorizer.jwt.claims.internalId as string)
          : null;

      const response = await controller.execute({
        body,
        params,
        queryParams,
        accountId,
      });

      return {
        statusCode: response.statusCode,
        body: response.body ? JSON.stringify(response.body) : undefined,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return lambdaErrorResponse({
          code: ErrorCode.VALIDATION,
          message: error.issues.map((issue) => ({
            field: issue.path.join("."),
            error: issue.message,
          })),
          statusCode: 400,
        });
      }

      if (error instanceof HttpError) return lambdaErrorResponse(error);

      if (error instanceof ApplicationError)
        return lambdaErrorResponse({
          statusCode: error.statusCode ?? 400,
          code: error.code,
          message: error.message,
        });

      console.error(error);
      return lambdaErrorResponse({
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
        statusCode: 500,
      });
    }
  };
}
