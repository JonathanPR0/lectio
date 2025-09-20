/* eslint-disable no-console */
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { Injectable } from "@kernel/decorators/Injectable";
import { ChatCompletionContentPart } from "openai/resources/index";
import { DailyQuestions } from "src/entities/DailyQuestions";
import z from "zod";
import { generateQuestionsPrompt } from "../prompts/generateQuestionsPrompt";
import { verifyTerminologyPrompt } from "../prompts/verifyTerminologyPrompt";

const questionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.number().min(0),
      text: z.string(),
      difficulty: z.nativeEnum(DailyQuestions.Difficulty),
      points: z.number(),
      options: z.array(z.string()),
      correctOptionIndex: z.number().min(0),
      answer: z.string(),
    })
  ),
});

@Injectable()
export class QuestionsAIGateway {
  constructor() {}

  private readonly client = new OpenAI();
  private readonly model = "gpt-4.1-mini";

  async processQuestionsAI({
    themeVerse,
    bibleVersicle,
    paragraphs,
  }: QuestionsAIGateway.ProcessQuestionsAIParams): Promise<QuestionsAIGateway.ProcessQuestionsAI> {
    // Passo 1: Gerar as perguntas iniciais
    const initialQuestions = await this.callAI({
      systemPrompt: generateQuestionsPrompt(),
      userMessageParts: `DailyText:
        ThemeVerse: ${themeVerse}
        BibleVersicle: ${bibleVersicle}
        Paragraphs: ${paragraphs.join("\n\n")}`,
    });

    // Passo 2: Verificar e corrigir a terminologia
    return this.verifyTerminology(initialQuestions);
  }

  private async verifyTerminology(
    questions: QuestionsAIGateway.ProcessQuestionsAI
  ): Promise<QuestionsAIGateway.ProcessQuestionsAI> {
    // Verificar se há termos não permitidos
    const prohibitedTerms = this.checkForProhibitedTerms(questions);

    if (prohibitedTerms.length === 0) {
      return questions;
    }

    // Corrigir a terminologia
    return this.callAI({
      systemPrompt: verifyTerminologyPrompt(),
      userMessageParts: `Review and correct these Bible study questions for Jehovah's Witnesses. 
      Replace any inappropriate terminology while maintaining the meaning and structure:
      
      ${JSON.stringify(questions, null, 2)}
      
      Terminology issues found: ${prohibitedTerms.join(", ")}`,
    });
  }

  private checkForProhibitedTerms(questions: QuestionsAIGateway.ProcessQuestionsAI): string[] {
    const prohibitedTerms = [
      "culto",
      "cultos",
      "templo",
      "templos",
      "igreja",
      "igrejas",
      "cerimônia",
      "cerimônias",
      "ritual",
      "rituais",
      "liturgia",
      "litúrgica",
      "altar",
      "altares",
      "oferenda",
      "oferendas",
      "dízimo",
      "dízimos",
      "pastor",
      "pastores",
      "padre",
      "padres",
      "missa",
      "missas",
      "santo",
      "santos",
      "evangelismo",
      "evangelizar",
    ];

    const foundTerms: string[] = [];

    // Verificar em todas as perguntas e opções
    questions.questions.forEach((question) => {
      // Verificar no texto da pergunta
      prohibitedTerms.forEach((term) => {
        if (
          question.text.toLowerCase().includes(term.toLowerCase()) &&
          !foundTerms.includes(term)
        ) {
          foundTerms.push(term);
        }
      });

      // Verificar nas opções
      question.options.forEach((option) => {
        prohibitedTerms.forEach((term) => {
          if (option.toLowerCase().includes(term.toLowerCase()) && !foundTerms.includes(term)) {
            foundTerms.push(term);
          }
        });
      });
    });

    return foundTerms;
  }

  private async callAI({
    systemPrompt,
    userMessageParts,
  }: QuestionsAIGateway.CallAIParams): Promise<QuestionsAIGateway.ProcessQuestionsAI> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.3, // Temperatura baixa para seguir instruções mais rigorosamente
      response_format: zodResponseFormat(questionsSchema, "dailyTextQuestions"),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessageParts,
        },
      ],
    });

    const json = response.choices[0].message.content;

    if (!json) {
      console.error("OpenAI response:", JSON.stringify(response, null, 2));
      throw new Error(`Failed processing daily text questions`);
    }

    const { success, data, error } = questionsSchema.safeParse(JSON.parse(json));

    if (!success) {
      console.error("Zod error:", JSON.stringify(error.issues));
      console.error("OpenAI response:", JSON.stringify(response, null, 2));
      throw new Error(`Failed processing daily text questions`);
    }

    return data;
  }
}

export namespace QuestionsAIGateway {
  // Tipos permanecem iguais...
  export type ProcessQuestionsAI = {
    questions: {
      id: number;
      text: string;
      difficulty: DailyQuestions.Difficulty;
      points: number;
      options: string[];
      correctOptionIndex: number;
      answer: string;
    }[];
  };

  export type ProcessQuestionsAIParams = {
    themeVerse: string;
    bibleVersicle: string;
    paragraphs: string[];
  };

  export type CallAIParams = {
    systemPrompt: string;
    userMessageParts: string | ChatCompletionContentPart[];
  };
}
