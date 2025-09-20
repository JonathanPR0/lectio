import { DailyQuestions } from "src/entities/DailyQuestions";
import z from "zod";

export const createDailyQuestionsSchema = z.object({
  date: z.string().min(1, "'date' is required"),
  questions: z.array(
    z.object({
      id: z.number().min(0, "'id' is required"),
      text: z.string().min(0, "'text' is required"),
      difficulty: z.nativeEnum(DailyQuestions.Difficulty),
      points: z.number().min(0, "'points' is required"),
      options: z.array(z.string()).min(1, "'options' is required"),
      correctOptionIndex: z.number().min(0, "'correctOptionIndex' is required"),
      answer: z.string().min(0, "'answer' is required"),
    })
  ),
});

export type CreateDailyQuestionsBody = z.infer<typeof createDailyQuestionsSchema>;
