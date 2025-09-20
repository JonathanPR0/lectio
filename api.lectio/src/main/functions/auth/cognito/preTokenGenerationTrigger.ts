import { PreTokenGenerationV2TriggerEvent } from "aws-lambda";
import "reflect-metadata";

// You can use this event to add custom claims to the token
// const repo = Registry.getInstance().resolve(AccountRepository);

export async function handler(event: PreTokenGenerationV2TriggerEvent) {
  // This is an example of adding a custom claim to the token
  // const user = await repo.findByEmail(event.request.userAttributes.email);

  event.response = {
    claimsAndScopeOverrideDetails: {
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          internalId: event.request.userAttributes["custom:internalId"] || "",
        },
      },
    },
  };
  return event;
}
