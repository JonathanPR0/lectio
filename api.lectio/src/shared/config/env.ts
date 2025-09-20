import z from "zod";

export const schema = z.object({
  // COGNITO
  COGNITO_CLIENT_ID: z.string().min(1),
  COGNITO_CLIENT_SECRET: z.string().min(1),
  COGNITO_POOL_ID: z.string().min(1),

  // DATABASE
  MAIN_TABLE_NAME: z.string().min(1),

  // STORAGE
  // AI_FILES_BUCKET: z.string().min(1),

  // CDNs
  // AI_FILES_CDN_DOMAIN_NAME: z.string().min(1),

  // QUEUES
  DAILY_QUESTIONS_QUEUE_URL: z.string().min(1),
  DAILY_TEXTS_QUEUE_URL: z.string().min(1),
});

function getEnv() {
  try {
    return schema.parse(process.env);
  } catch (error) {
    console.error("ERRO", error);
    throw new Error("Invalid environment variables");
  }
}

export const env = getEnv();
