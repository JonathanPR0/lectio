// import { HeadObjectCommand } from "@aws-sdk/client-s3";
// import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
// import { s3Client } from "@infra/clients/s3Client";
// import { Injectable } from "@kernel/decorators/Injectable";
// import KSUID from "ksuid";
// import { AIResponse } from "src/entities/AIResponse";
// import { AppConfig } from "src/shared/config/AppConfig";
// import { minutesToSeconds } from "src/shared/utils/minutesToSeconds";

// @Injectable()
// export class AIFileStorageGateway {
//   constructor(private readonly config: AppConfig) {}

//   static generateInputFileKey({
//     accountId,
//     inputType,
//   }: AIFileStorageGateway.GenerateInputFileKeyParams): string {
//     const extension = inputType === AIResponse.InputType.AUDIO ? "m4a" : "jpeg";
//     const filename = `${KSUID.randomSync().string}.${extension}`;

//     return `${accountId}/${filename}`;
//   }

//   getFileURL(fileKey: string) {
//     return `https://${this.config.cdns.aiFilesCDN}/${fileKey}`;
//   }

//   async createPOST({
//     file,
//     aiResponseId,
//     accountId,
//     origin,
//   }: AIFileStorageGateway.CreatePOSTParams): Promise<AIFileStorageGateway.CreatePOSTResult> {
//     const bucket = this.config.storage.AIFilesBucketCDN;
//     const contentType = file.inputType === AIResponse.InputType.AUDIO ? "audio/m4a" : "image/jpeg";

//     const { url, fields } = await createPresignedPost(s3Client, {
//       Bucket: bucket,
//       Key: file.key,
//       Expires: minutesToSeconds(5),
//       Conditions: [
//         { bucket },
//         ["eq", "$key", file.key],
//         ["eq", "$Content-Type", contentType],
//         ["content-length-range", file.size, file.size],
//       ],
//       Fields: {
//         "x-amz-meta-accountid": accountId,
//         "x-amz-meta-airesponseid": aiResponseId,
//         "x-amz-meta-origin": origin,
//       },
//     });

//     const uploadSignature = Buffer.from(
//       JSON.stringify({
//         url,
//         fields: {
//           ...fields,
//           "Content-Type": contentType,
//         },
//       })
//     ).toString("base64");

//     return { uploadSignature };
//   }

//   async getFileMetadata({
//     fileKey,
//   }: AIFileStorageGateway.GetFileMetadataParams): Promise<AIFileStorageGateway.GetFileMetadataResult> {
//     const command = new HeadObjectCommand({
//       Bucket: this.config.storage.AIFilesBucketCDN,
//       Key: fileKey,
//     });

//     const { Metadata = {} } = await s3Client.send(command);

//     if (!Metadata.accountid || !Metadata.airesponseid) {
//       throw new Error(`[getFileMetadata] Cannot process file "${fileKey}"`);
//     }

//     return {
//       accountId: Metadata.accountid,
//       aiResponseId: Metadata.airesponseid,
//     };
//   }
// }

// export namespace AIFileStorageGateway {
//   export type GenerateInputFileKeyParams = {
//     accountId: string;
//     inputType: AIResponse.InputType;
//   };

//   export type CreatePOSTParams = {
//     aiResponseId: string;
//     accountId: string;
//     origin: string;
//     file: {
//       key: string;
//       size: number;
//       inputType: AIResponse.InputType;
//     };
//   };

//   export type CreatePOSTResult = {
//     uploadSignature: string;
//   };

//   export type GetFileMetadataParams = {
//     fileKey: string;
//   };

//   export type GetFileMetadataResult = {
//     accountId: string;
//     aiResponseId: string;
//   };
// }
