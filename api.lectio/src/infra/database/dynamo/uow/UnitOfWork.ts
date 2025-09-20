import {
  DeleteCommandInput,
  PutCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "@infra/clients/dynamoClient";

export abstract class UnitOfWork {
  private transactItems: NonNullable<TransactWriteCommandInput["TransactItems"]> = [];

  protected addPut(putInput: PutCommandInput) {
    this.transactItems.push({ Put: putInput });
  }

  protected addUpdate(updateInput: UpdateCommandInput) {
    // Ensure UpdateExpression is present and cast to the expected type
    if (!updateInput.UpdateExpression) {
      throw new Error("UpdateExpression is required for DynamoDB TransactWrite Update item.");
    }
    this.transactItems.push({
      Update: {
        ...updateInput,
        Key: updateInput.Key as Record<string, any>,
        ExpressionAttributeValues: updateInput.ExpressionAttributeValues as
          | Record<string, any>
          | undefined,
        UpdateExpression: updateInput.UpdateExpression,
      },
    });
  }

  protected addDelete(deleteInput: DeleteCommandInput) {
    this.transactItems.push({ Delete: deleteInput });
  }

  protected clearTransactItems() {
    this.transactItems = [];
  }

  protected async commit() {
    await dynamoClient.send(
      new TransactWriteCommand({
        TransactItems: this.transactItems,
      })
    );
  }
}
