import { Injectable } from "@kernel/decorators/Injectable";
import { env } from "./env";

@Injectable()
export class AppConfig {
  readonly auth: AppConfig.Auth;
  readonly db: AppConfig.Database;
  // readonly storage: AppConfig.Storage;
  // readonly cdns: AppConfig.CDNs;
  readonly queues: AppConfig.Queues;

  constructor() {
    this.auth = {
      cognito: {
        client: {
          id: env.COGNITO_CLIENT_ID,
          secret: env.COGNITO_CLIENT_SECRET,
        },
        pool: {
          id: env.COGNITO_POOL_ID,
        },
      },
    };
    this.db = {
      dynamodb: {
        mainTable: env.MAIN_TABLE_NAME,
      },
    };
    // this.storage = {
    //   AIFilesBucketCDN: env.AI_FILES_BUCKET,
    // };
    // this.cdns = {
    //   aiFilesCDN: env.AI_FILES_CDN_DOMAIN_NAME,
    // };
    this.queues = {
      dailyQuestionsQueueUrl: env.DAILY_QUESTIONS_QUEUE_URL,
      dailyTextsQueueUrl: env.DAILY_TEXTS_QUEUE_URL,
    };
  }
}

export namespace AppConfig {
  export type Auth = {
    cognito: {
      client: {
        id: string;
        secret: string;
      };
      pool: {
        id: string;
      };
    };
  };
  export type Database = {
    dynamodb: {
      mainTable: string;
    };
  };
  export type Storage = {
    AIFilesBucketCDN: string;
  };
  export type CDNs = {
    aiFilesCDN?: string;
  };
  export type Queues = {
    dailyQuestionsQueueUrl: string;
    dailyTextsQueueUrl: string;
  };
}
