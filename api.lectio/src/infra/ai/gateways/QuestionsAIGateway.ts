/* eslint-disable no-console */
import { Injectable } from "@kernel/decorators/Injectable";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
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
    }),
  ),
});

@Injectable()
export class QuestionsAIGateway {
  private readonly client = new OpenAI();
  private readonly model = "gpt-5.6-luna";

  /**
   * FLUXO PRINCIPAL: Orquestra a criação, verificação e formatação das perguntas.
   */
  async processQuestionsAI({
    themeVerse,
    bibleVersicle,
    paragraphs,
  }: QuestionsAIGateway.ProcessQuestionsAIParams): Promise<QuestionsAIGateway.ProcessQuestionsAI> {
    // Passo 1: Geração bruta das perguntas
    const initialQuestions = await this.callAI({
      systemPrompt: generateQuestionsPrompt(),
      userMessageParts: `
        <daily_text_context>
          <theme_verse>${themeVerse}</theme_verse>
          <bible_reference>${bibleVersicle}</bible_reference>
          <explanation>
            ${paragraphs.join("\n\n")}
          </explanation>
        </daily_text_context>
      `,
    });

    // Passo 2: Auditoria de terminologia
    const verifiedQuestions = await this.verifyTerminology(initialQuestions);

    // Passo 3: Randomização das alternativas
    return this.shuffleQuestionOptions(verifiedQuestions);
  }

  /**
   * CIRURGIA DE TERMINOLOGIA: Só envia para a IA as perguntas que falharam nas regras.
   */
  private async verifyTerminology(
    data: QuestionsAIGateway.ProcessQuestionsAI,
  ): Promise<QuestionsAIGateway.ProcessQuestionsAI> {
    const issues = this.getQuestionsWithProhibitedTerms(data);

    // Se nenhuma pergunta tiver termos proibidos, retorna os dados originais imediatamente
    if (issues.length === 0) {
      return data;
    }

    console.log(`[Auditoria] Corrigindo terminologia em ${issues.length} pergunta(s)...`);

    const flawedQuestions = {
      questions: issues.map((issue) => issue.question),
    };

    const issuesDescriptions = issues
      .map((i) => `Pergunta ID ${i.question.id}: Termos encontrados [${i.foundTerms.join(", ")}]`)
      .join("\n");

    const correctedData = await this.callAI({
      systemPrompt: verifyTerminologyPrompt(),
      userMessageParts: `
        <instruction>
          Review and correct ONLY these specific Bible study questions.
          Replace the inappropriate terminology while maintaining the exact meaning, difficulty, and structure.
        </instruction>

        <flawed_questions>
          ${JSON.stringify(flawedQuestions, null, 2)}
        </flawed_questions>

        <issues_found>
          ${issuesDescriptions}
        </issues_found>
      `,
    });

    // Mescla as perguntas corrigidas de volta na posição original do array
    const finalQuestions = [...data.questions];
    correctedData.questions.forEach((correctedQuestion, indexNaRespostaDaIA) => {
      const originalIndex = issues[indexNaRespostaDaIA]?.originalIndex;
      if (originalIndex !== undefined) {
        finalQuestions[originalIndex] = correctedQuestion;
      }
    });

    return { questions: finalQuestions };
  }

  /**
   * VARREDURA LOCAL: Lê as perguntas geradas e acusa quais têm palavras proibidas.
   */
  private getQuestionsWithProhibitedTerms(
    data: QuestionsAIGateway.ProcessQuestionsAI,
  ): Array<{ originalIndex: number; question: any; foundTerms: string[] }> {
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
      "sacramento",
      "sacramentos",
    ];

    const issues: Array<{ originalIndex: number; question: any; foundTerms: string[] }> = [];

    data.questions.forEach((question, index) => {
      const foundTerms = new Set<string>();
      const contentToScan = [question.text, question.answer, ...question.options].map((text) =>
        text.toLowerCase(),
      );

      prohibitedTerms.forEach((term) => {
        if (contentToScan.some((text) => text.includes(term.toLowerCase()))) {
          foundTerms.add(term);
        }
      });

      if (foundTerms.size > 0) {
        issues.push({
          originalIndex: index,
          question,
          foundTerms: Array.from(foundTerms),
        });
      }
    });

    return issues;
  }

  /**
   * RANDOMIZAÇÃO: Embaralha as alternativas no backend usando Fisher-Yates.
   */
  private shuffleQuestionOptions(
    data: QuestionsAIGateway.ProcessQuestionsAI,
  ): QuestionsAIGateway.ProcessQuestionsAI {
    const shuffledQuestions = data.questions.map((question) => {
      const originalCorrectAnswerText = question.options[question.correctOptionIndex];
      const optionsWithMeta = question.options.map((optionText, index) => ({
        text: optionText,
        isCorrect: index === question.correctOptionIndex,
      }));

      // Algoritmo Fisher-Yates
      for (let i = optionsWithMeta.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsWithMeta[i], optionsWithMeta[j]] = [optionsWithMeta[j], optionsWithMeta[i]];
      }

      const newCorrectIndex = optionsWithMeta.findIndex((item) => item.isCorrect);

      return {
        ...question,
        options: optionsWithMeta.map((item) => item.text),
        correctOptionIndex: newCorrectIndex !== -1 ? newCorrectIndex : 0,
        answer: question.answer || originalCorrectAnswerText,
      };
    });

    return { questions: shuffledQuestions };
  }

  /**
   * EXECUTOR DA API: Chama a OpenAI e tenta recuperar automaticamente falhas de JSON.
   */
  private async callAI({
    systemPrompt,
    userMessageParts,
    maxRetries = 1,
  }: QuestionsAIGateway.CallAIParams): Promise<QuestionsAIGateway.ProcessQuestionsAI> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          response_format: zodResponseFormat(questionsSchema, "dailyTextQuestions"),
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessageParts },
          ],
        });

        const json = response.choices[0]?.message?.content;
        if (!json) throw new Error("A IA retornou um conteúdo vazio.");

        const { success, data, error } = questionsSchema.safeParse(JSON.parse(json));
        if (!success) throw new Error(`Erro de Zod Validation: ${JSON.stringify(error.issues)}`);

        return data;
      } catch (error: any) {
        console.warn(`[API Attempt ${attempt + 1}] Falha: ${error.message}`);

        if (attempt === maxRetries) {
          console.error("[API Failed] Tentativas esgotadas.");
          throw error;
        }

        if (error?.status === 429) {
          console.warn("[Rate Limit 429] Aguardando 5 segundos antes de tentar novamente...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    throw new Error("Erro inesperado na fila de IA.");
  }
}

export namespace QuestionsAIGateway {
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
    maxRetries?: number;
  };
}
