import { z } from "zod";

const SCHEMA_METADATA_KEY = "custom:schema";

export function Schema(schema: z.ZodTypeAny): ClassDecorator {
  return function (target: any) {
    Reflect.defineMetadata(SCHEMA_METADATA_KEY, schema, target);
  };
}

export function getSchema(target: any): z.ZodTypeAny | undefined {
  return Reflect.getMetadata(SCHEMA_METADATA_KEY, target.constructor);
}
