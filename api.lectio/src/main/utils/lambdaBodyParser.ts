import { APIGatewayProxyEventV2 } from "aws-lambda";

export default function handler(body: APIGatewayProxyEventV2["body"]) {
  try {
    return body ? JSON.parse(body) : {};
  } catch {
    throw new Error("Malformed JSON body");
  }
}
