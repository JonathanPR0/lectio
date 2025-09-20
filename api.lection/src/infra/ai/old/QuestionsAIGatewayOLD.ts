// /* eslint-disable no-console */
// import OpenAI from "openai";
// import { zodResponseFormat } from "openai/helpers/zod";

// import { Injectable } from "@kernel/decorators/Injectable";
// import { ChatCompletionContentPart } from "openai/resources/index";
// import { DailyQuestions } from "src/entities/DailyQuestions";
// import z from "zod";
// import { getTextQuestionsPrompt } from "../prompts/generateQuestionsPrompt";
// const questionsSchema = z.object({
//   questions: z.array(
//     z.object({
//       id: z.number().min(0),
//       text: z.string(),
//       difficulty: z.nativeEnum(DailyQuestions.Difficulty),
//       points: z.number(),
//       options: z.array(z.string()),
//       correctOptionIndex: z.number().min(0),
//       answer: z.string(),
//     })
//   ),
// });

// @Injectable()
// export class QuestionsAIGateway {
//   constructor() {}

//   private readonly client = new OpenAI();

//   async processQuestionsAI({
//     themeVerse,
//     bibleVersicle,
//     paragraphs,
//   }: QuestionsAIGateway.ProcessQuestionsAIParams): Promise<QuestionsAIGateway.ProcessQuestionsAI> {
//     return this.callAI({
//       systemPrompt: getTextQuestionsPrompt(),
//       userMessageParts: `DailyText:
//         ThemeVerse: ${themeVerse}
//         BibleVersicle: ${bibleVersicle}
//         Paragraphs: ${paragraphs.join("\n\n")}
//         `,
//     });
//   }

//   private async callAI({
//     systemPrompt,
//     userMessageParts,
//   }: QuestionsAIGateway.CallAIParams): Promise<QuestionsAIGateway.ProcessQuestionsAI> {
//     const response = await this.client.chat.completions.create({
//       model: "gpt-4.1-mini",
//       temperature: 0.3, // Reduzir para seguir instruções mais rigorosamente
//       response_format: zodResponseFormat(questionsSchema, "dailyTextQuestions"),
//       messages: [
//         {
//           role: "system",
//           content: systemPrompt,
//         },
//         {
//           role: "user",
//           content: userMessageParts,
//         },
//       ],
//     });

//     const json = response.choices[0].message.content;

//     if (!json) {
//       console.error("OpenAI response:", JSON.stringify(response, null, 2));
//       throw new Error(`Failed processing daily text questions`);
//     }

//     const { success, data, error } = questionsSchema.safeParse(JSON.parse(json));

//     if (!success) {
//       console.error("Zod error:", JSON.stringify(error.issues));
//       console.error("OpenAI response:", JSON.stringify(response, null, 2));
//       throw new Error(`Failed processing daily text questions`);
//     }

//     return data;
//   }
// }

// export namespace QuestionsAIGateway {
//   export type ProcessQuestionsAI = {
//     questions: {
//       id: number;
//       text: string;
//       difficulty: DailyQuestions.Difficulty;
//       points: number;
//       options: string[];
//       correctOptionIndex: number;
//       answer: string;
//     }[];
//   };

//   export type ProcessQuestionsAIParams = {
//     themeVerse: string;
//     bibleVersicle: string;
//     paragraphs: string[];
//   };

//   export type CallAIParams = {
//     systemPrompt: string;
//     userMessageParts: string | ChatCompletionContentPart[];
//   };
// }
