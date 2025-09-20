import z from "zod";

export const answerQuestionSchema = z.object({
  idDailyQuestion: z.string().min(1, "'idDailyQuestion' is required"),
  idQuestion: z.number().min(0, "'id' is required"),
  userAnswer: z.string().min(1, "'userAnswer' is required"),
});

export type AnswerQuestionBody = z.infer<typeof answerQuestionSchema>;
